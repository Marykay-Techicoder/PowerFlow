import { db } from "@/lib/db";
import { InvoicesClient } from "./invoices-client";

export const revalidate = 0; // Disable cache

export default async function CustomerInvoicesPage() {
  let customer = await db.customer.findFirst({
    where: {
      email: "chioma.okafor@gmail.com",
    },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) {
    customer = await db.customer.findFirst({
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  const payments = customer ? customer.payments : [];

  return <InvoicesClient payments={payments as any} />;
}
