import { db } from "@/lib/db";
import { WebhooksClient } from "./webhooks-client";

export const revalidate = 0; // Disable cache

export default async function WebhooksPage() {
  const events = await db.webhookEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50, // Display last 50 events
  });

  return <WebhooksClient initialEvents={events as any} />;
}
