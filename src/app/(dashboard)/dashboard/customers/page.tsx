import { getCustomers } from "@/app/actions/customer-actions";
import { CustomerListClient } from "./customer-list-client";

export const revalidate = 0; // Disable caching so it fetches fresh data

export default async function CustomersPage() {
  const customers = await getCustomers();
  
  return <CustomerListClient initialCustomers={customers as any} />;
}
