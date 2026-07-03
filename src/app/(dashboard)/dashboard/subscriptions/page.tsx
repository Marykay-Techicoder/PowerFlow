import { getSubscriptions } from "@/app/actions/subscription-actions";
import { SubscriptionListClient } from "./subscription-list-client";

export const revalidate = 0; // Disable cache

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptions();
  return <SubscriptionListClient initialSubscriptions={subscriptions as any} />;
}
