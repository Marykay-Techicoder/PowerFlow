import { db } from "@/lib/db";
import { NotificationsClient } from "./notifications-client";

export const revalidate = 0; // Disable cache

export default async function NotificationsPage() {
  const notifications = await db.notification.findMany({
    orderBy: { sentAt: "desc" },
    include: {
      customer: true,
    },
  });

  return <NotificationsClient initialNotifications={notifications as any} />;
}
