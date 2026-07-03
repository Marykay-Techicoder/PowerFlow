import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BillingEngine } from "@/services/billing-engine";
import { NotificationService } from "@/services/notification-service";
import crypto from "crypto";

/**
 * Nomba Webhook Endpoint
 * Receives payment status updates and tokenization events.
 * 
 * Security: Verifies HMAC-SHA256 signature before processing.
 * Reference: Nomba Webhooks documentation
 */

function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  const webhookSecret = process.env.NOMBA_WEBHOOK_SECRET;
  
  // During development/demo without real Nomba, allow unsigned requests
  if (!webhookSecret) {
    console.warn("[Webhook] No NOMBA_WEBHOOK_SECRET configured — skipping signature verification");
    return true;
  }

  if (!signature) {
    console.error("[Webhook] Missing x-nomba-signature header");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nomba-signature");

    // Verify webhook signature
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("[Webhook] Invalid signature — rejecting webhook");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (!event || !data) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    console.log(`[Webhook Endpoint] Received Nomba event: ${event}`, data);

    // Save the event log in database
    const loggedEvent = await db.webhookEvent.create({
      data: {
        source: "nomba",
        eventType: event,
        payload: rawBody,
        processed: false,
      },
    });

    const orderRef = data.orderReference;
    if (!orderRef) {
      return NextResponse.json({ error: "Missing orderReference" }, { status: 400 });
    }

    // Look up the corresponding payment in database
    const payment = await db.payment.findUnique({
      where: { orderReference: orderRef },
      include: {
        subscription: {
          include: {
            customer: true,
            plan: true,
          },
        },
      },
    });

    if (!payment) {
      console.warn(`[Webhook Endpoint] Payment with orderReference ${orderRef} not found in DB`);
      return NextResponse.json({ message: "Webhook logged but no matching payment found" }, { status: 200 });
    }

    const sub = payment.subscription;

    if (event === "payment_success") {
      // Save tokenKey if returned
      if (data.tokenKey) {
        await db.customer.update({
          where: { id: sub.customerId },
          data: { tokenKey: data.tokenKey },
        });
      }

      // Reuse the shared payment success handler from BillingEngine
      await BillingEngine.handlePaymentSuccess(
        sub,
        payment.id,
        orderRef,
        data.transactionId || data.transactionRef || null
      );

    } else if (event === "payment_failed") {
      // Payment failure webhook — log event and notify
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: "failed",
          failureReason: data.failureReason || "insufficient_funds",
          nombaTransRef: data.transactionId,
        },
      });

      await db.subscriptionEvent.create({
        data: {
          subscriptionId: sub.id,
          type: "payment_failed",
          fromStatus: sub.status,
          toStatus: sub.status,
          description: `Payment failed webhook processed. Reason: ${data.failureReason || "Declined"}.`,
        },
      });

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

    // Mark webhook as processed
    await db.webhookEvent.update({
      where: { id: loggedEvent.id },
      data: { processed: true },
    });

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    console.error("[Webhook Endpoint] Error handling webhook", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
