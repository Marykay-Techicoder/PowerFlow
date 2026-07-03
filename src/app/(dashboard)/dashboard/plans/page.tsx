import { getPlans } from "@/app/actions/plan-actions";
import { PlanListClient } from "./plan-list-client";

export const revalidate = 0; // Disable cache

export default async function PlansPage() {
  const plans = await getPlans();
  return <PlanListClient initialPlans={plans as any} />;
}
