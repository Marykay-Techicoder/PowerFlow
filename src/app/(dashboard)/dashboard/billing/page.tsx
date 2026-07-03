import { db } from "@/lib/db";
import { BillingClient } from "./billing-client";

export const revalidate = 0; // Disable cache

export default async function BillingPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  const retries = await db.retryAttempt.findMany({
    orderBy: { scheduledAt: "desc" },
    include: {
      subscription: {
        include: {
          customer: true,
          plan: true,
        },
      },
    },
  });

  // Calculate revenue impact metrics
  const subscriptions = await db.subscription.findMany({
    include: { plan: true },
  });

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active" || s.status === "restored"
  );
  const graceSubscriptions = subscriptions.filter(
    (s) => s.status === "grace" || s.status === "retry_scheduled"
  );
  const suspendedSubscriptions = subscriptions.filter(
    (s) => s.status === "suspended"
  );

  const totalMrr = activeSubscriptions.reduce((sum, s) => sum + s.plan.amount, 0);
  const atRiskRevenue = graceSubscriptions.reduce((sum, s) => sum + s.plan.amount, 0);
  const lostRevenue = suspendedSubscriptions.reduce((sum, s) => sum + s.plan.amount, 0);

  // Count recovered payments (successful payments that came from a retry/restored flow)
  const recoveredPayments = payments.filter(
    (p) => p.status === "success" && p.subscription.status !== "active"
  ).length;
  const successfulPayments = payments.filter((p) => p.status === "success");
  const recoveredRevenue = successfulPayments
    .filter((p) =>
      p.subscription.status === "restored" ||
      p.subscription.status === "grace" ||
      p.subscription.status === "retry_scheduled"
    )
    .reduce((sum, p) => sum + p.amount, 0);

  // If no recovered data from status, estimate from retry successes
  const estimatedRecovered = retries.filter((r) => r.status === "success").length;
  const finalRecoveredCount = recoveredPayments || estimatedRecovered;
  const finalRecoveredRevenue = recoveredRevenue || (estimatedRecovered * (totalMrr / Math.max(activeSubscriptions.length, 1)));

  return (
    <BillingClient
      initialPayments={payments as any}
      initialRetries={retries as any}
      revenueMetrics={{
        activeSubscriptions: activeSubscriptions.length,
        atRiskSubscriptions: graceSubscriptions.length,
        suspendedSubscriptions: suspendedSubscriptions.length,
        totalMrr,
        atRiskRevenue,
        lostRevenue,
        recoveredPayments: finalRecoveredCount,
        recoveredRevenue: finalRecoveredRevenue,
      }}
    />
  );
}
