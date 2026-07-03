import { db } from "@/lib/db";
import { OverviewClient } from "./overview-client";

export const revalidate = 0; // Disable cache

export default async function DashboardPage() {
  // Fetch real counts from database
  const activeCount = await db.subscription.count({
    where: {
      status: {
        in: ["active", "restored"],
      },
    },
  });

  const graceCount = await db.subscription.count({
    where: {
      status: {
        in: ["grace", "retry_scheduled"],
      },
    },
  });

  const subscriptions = await db.subscription.findMany({
    include: {
      plan: true,
    },
  });

  // Calculate monthly MRR (Monthly Recurring Revenue)
  const totalMmr = subscriptions
    .filter((s) => s.status !== "suspended")
    .reduce((sum, s) => sum + s.plan.amount, 0);

  // Calculate real recovery rate from DB
  const [totalPayments, successfulPayments] = await Promise.all([
    db.payment.count(),
    db.payment.count({ where: { status: "success" } }),
  ]);
  const successRate = totalPayments > 0
    ? Math.round((successfulPayments / totalPayments) * 100)
    : 0;

  // Fetch recent events for the feed
  const recentEvents = await db.subscriptionEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      subscription: {
        include: {
          customer: true,
        },
      },
    },
  });

  return (
    <OverviewClient
      activeCount={activeCount}
      graceCount={graceCount}
      totalMmr={totalMmr}
      successRate={successRate}
      recentEvents={recentEvents as any}
    />
  );
}
