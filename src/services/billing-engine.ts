import { db } from "@/lib/db";
import { getPaymentProvider } from "./payment/payment-provider";
import { calculateCustomerHealth } from "./health-score";
import { getGracePeriodDays, getServiceLevel } from "./grace-mode";
import { RetryEngine } from "./retry-engine";
import { NotificationService } from "./notification-service";
import { generateOrderReference } from "@/lib/utils";
import { addMonths, addDays } from "date-fns";
import type { SubscriptionStatus, PaymentFailureReason } from "@/types";

// ─── Billing Options ────────────────────────────────────────

export interface BillingOptions {
  /** Force a specific outcome — eliminates race condition on provider singleton */
  forceOutcome?: "success" | "fail";
  /** Failure reason when forceOutcome is "fail" */
  failureReason?: PaymentFailureReason;
}

export class BillingEngine {
  /**
   * Processes a scheduled payment for a subscription.
   * Can be triggered by cron, manual billing override, or simulator scenario runner.
   */
  static async processBilling(
    subscriptionId: string,
    options?: BillingOptions
  ): Promise<boolean> {
    const sub = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { customer: true, plan: true },
    });

    if (!sub) {
      console.error(`Subscription ${subscriptionId} not found`);
      return false;
    }

    const provider = getPaymentProvider();
    const orderRef = generateOrderReference();

    // Create a pending payment record
    const payment = await db.payment.create({
      data: {
        customerId: sub.customerId,
        subscriptionId: sub.id,
        amount: sub.plan.amount,
        status: "pending",
        orderReference: orderRef,
      },
    });

    try {
      console.log(`[Billing Engine] Charging card for ${sub.customer.name} (Amount: ₦${sub.plan.amount})`);
      
      let result;

      // Handle forced outcomes (for simulation — no provider state mutation)
      if (options?.forceOutcome === "success") {
        result = {
          success: true,
          status: "success" as const,
          transactionRef: `SIM-SUCCESS-${Date.now()}`,
          failureReason: null,
        };
      } else if (options?.forceOutcome === "fail") {
        result = {
          success: false,
          status: "failed" as const,
          transactionRef: `SIM-FAIL-${Date.now()}`,
          failureReason: options.failureReason || "insufficient_funds",
        };
      } else if (sub.customer.tokenKey) {
        // Real flow: charge tokenized card
        result = await provider.chargeTokenizedCard({
          tokenKey: sub.customer.tokenKey,
          amount: sub.plan.amount,
          currency: "NGN",
          customerEmail: sub.customer.email,
          orderReference: orderRef,
        });
      } else {
        // No tokenized card — simulate checkout creation
        const checkout = await provider.createCheckout({
          amount: sub.plan.amount,
          currency: "NGN",
          customerEmail: sub.customer.email,
          customerName: sub.customer.name,
          orderReference: orderRef,
          tokenizeCard: true,
        });

        const verification = await provider.verifyTransaction(checkout.transactionRef || `MOCK-TXN-${Date.now()}`);
        
        result = {
          success: verification.status === "success",
          status: verification.status,
          transactionRef: verification.transactionRef,
          failureReason: null,
        };

        if (verification.tokenKey) {
          await db.customer.update({
            where: { id: sub.customerId },
            data: { tokenKey: verification.tokenKey },
          });
        }
      }

      if (result.success && result.status === "success") {
        // ─── Payment Succeeded ─────────────────────────────────
        await this.handlePaymentSuccess(sub, payment.id, orderRef, result.transactionRef || null);
        return true;
      } else {
        // ─── Payment Failed ────────────────────────────────────
        const reason = (result.failureReason || "insufficient_funds") as PaymentFailureReason;
        await this.handlePaymentFailure(sub, payment.id, orderRef, reason, result.transactionRef || null);
        return false;
      }
    } catch (e: any) {
      console.error("[Billing Engine] Error processing payment", e);
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          failureReason: "gateway_timeout",
        },
      });
      return false;
    }
  }

  /**
   * Shared payment success handler — used by both billing engine and webhook route.
   * Wraps all DB mutations in a Prisma transaction for atomicity.
   */
  static async handlePaymentSuccess(
    sub: {
      id: string;
      status: string;
      customerId: string;
      plan: { amount: number; name: string };
      customer: { name: string; phone: string; email: string };
    },
    paymentId: string,
    orderRef: string,
    transactionRef: string | null
  ): Promise<void> {
    const oldStatus = sub.status as SubscriptionStatus;
    const newStatus: SubscriptionStatus =
      oldStatus === "grace" || oldStatus === "retry_scheduled" || oldStatus === "suspended"
        ? "restored"
        : "active";

    const nextBilling = addMonths(new Date(), 1);

    // Atomic transaction — all DB writes succeed or fail together
    await db.$transaction([
      db.payment.update({
        where: { id: paymentId },
        data: {
          status: "success",
          nombaTransRef: transactionRef,
        },
      }),
      db.subscription.update({
        where: { id: sub.id },
        data: {
          status: newStatus,
          retryCount: 0,
          nextBillingDate: nextBilling,
          graceStartedAt: null,
          graceExpiresAt: null,
          serviceLevel: getServiceLevel(newStatus),
        },
      }),
      db.subscriptionEvent.create({
        data: {
          subscriptionId: sub.id,
          type: newStatus === "restored" ? "service_restored" : "payment_success",
          fromStatus: oldStatus,
          toStatus: newStatus,
          description: `Payment of ₦${sub.plan.amount.toLocaleString()} completed. Service status: ${newStatus.toUpperCase()}.`,
        },
      }),
      db.webhookEvent.create({
        data: {
          eventType: "payment_success",
          payload: JSON.stringify({
            event: "payment_success",
            data: {
              orderReference: orderRef,
              transactionRef,
              amount: sub.plan.amount,
              customerId: sub.customerId,
              subscriptionId: sub.id,
            },
          }),
        },
      }),
    ]);

    // Side effects (notifications) — outside transaction
    await this.updateCustomerHealth(sub.customerId);

    await NotificationService.send(
      {
        customerId: sub.customerId,
        customerName: sub.customer.name,
        customerPhone: sub.customer.phone,
        customerEmail: sub.customer.email,
        amount: sub.plan.amount,
        planName: sub.plan.name,
      },
      "payment_success"
    );

    if (newStatus === "restored") {
      await NotificationService.send(
        {
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerPhone: sub.customer.phone,
          customerEmail: sub.customer.email,
          amount: sub.plan.amount,
          planName: sub.plan.name,
        },
        "service_restored"
      );
    }
  }

  /**
   * Shared payment failure handler.
   * Manages retry scheduling, grace mode transitions, and suspension.
   */
  private static async handlePaymentFailure(
    sub: {
      id: string;
      status: string;
      customerId: string;
      retryCount: number;
      plan: { amount: number; name: string };
      customer: { name: string; phone: string; email: string; healthGrade: string };
    },
    paymentId: string,
    orderRef: string,
    reason: PaymentFailureReason,
    transactionRef: string | null
  ): Promise<void> {
    await db.payment.update({
      where: { id: paymentId },
      data: {
        status: "failed",
        failureReason: reason,
        nombaTransRef: transactionRef,
      },
    });

    // Update health score (failed charge impacts health)
    await this.updateCustomerHealth(sub.customerId);

    // Trigger Smart Retry or Suspend
    const wasScheduled = await RetryEngine.scheduleNext(sub.id, sub.retryCount, sub.plan.amount);

    if (wasScheduled) {
      const isFirstFailure = sub.status === "active" || sub.status === "restored";
      
      if (isFirstFailure) {
        const graceDays = getGracePeriodDays(sub.customer.healthGrade as HealthGradeType);
        const graceExpires = addDays(new Date(), graceDays);

        await db.$transaction([
          db.subscription.update({
            where: { id: sub.id },
            data: {
              status: "grace",
              graceStartedAt: new Date(),
              graceExpiresAt: graceExpires,
              serviceLevel: getServiceLevel("grace"),
            },
          }),
          db.subscriptionEvent.create({
            data: {
              subscriptionId: sub.id,
              type: "grace_entered",
              fromStatus: sub.status,
              toStatus: "grace",
              description: `First payment failed. Grace Mode activated for ${graceDays} days.`,
            },
          }),
        ]);

        await NotificationService.send(
          {
            customerId: sub.customerId,
            customerName: sub.customer.name,
            customerPhone: sub.customer.phone,
            customerEmail: sub.customer.email,
            amount: sub.plan.amount,
            planName: sub.plan.name,
            graceDays,
          },
          "grace_warning"
        );
      } else {
        await db.subscription.update({
          where: { id: sub.id },
          data: {
            status: "retry_scheduled",
            serviceLevel: getServiceLevel("retry_scheduled"),
          },
        });
      }
    } else {
      // ─── Suspension ─────────────────────────────────────────
      await db.$transaction([
        db.subscription.update({
          where: { id: sub.id },
          data: {
            status: "suspended",
            serviceLevel: getServiceLevel("suspended"),
            graceExpiresAt: null,
          },
        }),
        db.subscriptionEvent.create({
          data: {
            subscriptionId: sub.id,
            type: "service_suspended",
            fromStatus: sub.status,
            toStatus: "suspended",
            description: `Max payment retries reached. Service suspended (Power level set to 0%).`,
          },
        }),
      ]);

      await NotificationService.send(
        {
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerPhone: sub.customer.phone,
          customerEmail: sub.customer.email,
          amount: sub.plan.amount,
          planName: sub.plan.name,
        },
        "payment_failed"
      );
    }

    // Log webhook event
    await db.webhookEvent.create({
      data: {
        eventType: "payment_failed",
        payload: JSON.stringify({
          event: "payment_failed",
          data: {
            orderReference: orderRef,
            transactionRef,
            amount: sub.plan.amount,
            customerId: sub.customerId,
            subscriptionId: sub.id,
            failureReason: reason,
          },
        }),
      },
    });
  }

  /**
   * Recalculates and updates customer health score and grade.
   */
  private static async updateCustomerHealth(customerId: string): Promise<void> {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
      include: {
        payments: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        subscriptions: {
          include: {
            retries: true,
          },
        },
      },
    });

    if (!customer) return;

    const allRetries = customer.subscriptions.flatMap((s) => s.retries);
    const { score, grade } = calculateCustomerHealth(customer.payments, allRetries);

    await db.customer.update({
      where: { id: customerId },
      data: {
        healthScore: score,
        healthGrade: grade,
      },
    });

    console.log(`[Billing Engine] Updated health score for ${customer.name}: ${score} (${grade.toUpperCase()})`);
  }
}

// Import type for health grade
type HealthGradeType = import("@/types").HealthGrade;
