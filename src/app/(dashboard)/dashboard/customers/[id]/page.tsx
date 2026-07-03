import { getCustomer } from "@/app/actions/customer-actions";
import { getPlans } from "@/app/actions/plan-actions";
import { db } from "@/lib/db";
import { CustomerDetailClient } from "./customer-detail-client";
import { redirect } from "next/navigation";

export const revalidate = 0; // Disable cache

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);
  const plans = await getPlans();

  if (!customer) {
    redirect("/dashboard/customers");
  }

  // Fetch subscription lifecycle data (retries + events) for the first subscription
  const firstSub = customer.subscriptions?.[0];
  let retries: any[] = [];
  let events: any[] = [];

  if (firstSub) {
    const subWithTimelines = await db.subscription.findUnique({
      where: { id: firstSub.id },
      include: {
        retries: {
          orderBy: { scheduledAt: "desc" },
        },
        events: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    retries = subWithTimelines?.retries || [];
    events = subWithTimelines?.events || [];
  }

  return (
    <CustomerDetailClient
      customer={customer as any}
      availablePlans={plans as any}
      retries={retries as any}
      events={events as any}
    />
  );
}
