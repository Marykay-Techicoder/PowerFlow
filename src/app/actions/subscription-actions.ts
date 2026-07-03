"use server";

import { db } from "@/lib/db";
import { BillingEngine } from "@/services/billing-engine";
import { getPaymentProvider } from "@/services/payment/payment-provider";
import { revalidatePath } from "next/cache";
import { authGuard } from "@/lib/auth-guard";
import { CreateSubscriptionSchema, IdSchema, SimulateFailureSchema } from "@/lib/validators";
import type { PaymentFailureReason } from "@/types";

export async function getSubscriptions() {
  try {
    return await db.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        plan: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return [];
  }
}

export async function getSubscription(id: string) {
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return null;

  try {
    return await db.subscription.findUnique({
      where: { id: parsed.data },
      include: {
        customer: true,
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        retries: {
          orderBy: { scheduledAt: "desc" },
        },
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch subscription ${id}:`, error);
    return null;
  }
}

export async function createSubscription(formData: {
  customerId: string;
  planId: string;
  billingCycle?: string;
}) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const parsed = CreateSubscriptionSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const plan = await db.utilityPlan.findUnique({ where: { id: parsed.data.planId } });
    if (!plan) {
      return { success: false, error: "Plan not found" };
    }

    const nextBillingDate = new Date();
    
    const subscription = await db.subscription.create({
      data: {
        customerId: parsed.data.customerId,
        planId: parsed.data.planId,
        status: "active",
        billingCycle: parsed.data.billingCycle || "monthly",
        nextBillingDate,
        serviceLevel: 100,
        retryCount: 0,
      },
    });

    // Run first charge immediately
    await BillingEngine.processBilling(subscription.id);

    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/customers");
    return { success: true, subscription };
  } catch (error: any) {
    console.error("Failed to create subscription:", error);
    return { success: false, error: error.message || "Failed to create subscription" };
  }
}

/**
 * Triggers standard billing cycle charge (uses random success rate of provider)
 */
export async function triggerManualBilling(subscriptionId: string) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const parsed = IdSchema.safeParse(subscriptionId);
  if (!parsed.success) return { success: false, error: "Invalid subscription ID" };

  try {
    const success = await BillingEngine.processBilling(parsed.data);
    
    revalidatePath(`/dashboard/subscriptions/${subscriptionId}`);
    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    
    return { success };
  } catch (error: any) {
    console.error("Manual billing trigger failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Forces billing to succeed (restores service)
 */
export async function simulatePaymentSuccess(subscriptionId: string) {
  // Auth guard skipped for customer portal self-service payment
  const parsed = IdSchema.safeParse(subscriptionId);
  if (!parsed.success) return { success: false, error: "Invalid subscription ID" };

  try {
    const success = await BillingEngine.processBilling(parsed.data, { forceOutcome: "success" });
    
    revalidatePath(`/dashboard/subscriptions/${subscriptionId}`);
    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    revalidatePath("/customer");
    
    return { success };
  } catch (error: any) {
    console.error("Simulated payment success failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Forces billing to fail with a specific reason (enters grace/retry flow)
 */
export async function simulatePaymentFailure(subscriptionId: string, reason: string) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const parsed = SimulateFailureSchema.safeParse({ subscriptionId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const success = await BillingEngine.processBilling(
      parsed.data.subscriptionId,
      { forceOutcome: "fail", failureReason: parsed.data.reason as PaymentFailureReason }
    );
    
    revalidatePath(`/dashboard/subscriptions/${subscriptionId}`);
    revalidatePath("/dashboard/subscriptions");
    revalidatePath("/dashboard/customers");
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    
    return { success };
  } catch (error: any) {
    console.error("Simulated payment failure failed:", error);
    return { success: false, error: error.message };
  }
}
