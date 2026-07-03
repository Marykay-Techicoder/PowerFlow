import { db } from "@/lib/db";
import { CustomerClient } from "./customer-client";
import { redirect } from "next/navigation";

export const revalidate = 0; // Disable cache

export default async function CustomerPortalPage() {
  // Fetch Chioma Okafor as the default customer representation for portal demo
  const customer = await db.customer.findFirst({
    where: {
      email: "chioma.okafor@gmail.com",
    },
    include: {
      subscriptions: {
        include: {
          plan: true,
          retries: {
            orderBy: { scheduledAt: "asc" },
          },
        },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!customer) {
    // Fallback: get any customer if Chioma isn't seeded yet
    const anyCustomer = await db.customer.findFirst({
      include: {
        subscriptions: {
          include: {
            plan: true,
            retries: {
              orderBy: { scheduledAt: "asc" },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!anyCustomer) {
      return (
        <div style={{ padding: "40px", textAlign: "center" }}>
          <h2>No Customer Data Found</h2>
          <p>Please seed the database first.</p>
        </div>
      );
    }

    return <CustomerClient customer={anyCustomer as any} />;
  }

  return <CustomerClient customer={customer as any} />;
}
