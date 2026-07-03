import { db } from "@/lib/db";
import type { NotificationChannel, NotificationType } from "@/types";
import { format } from "date-fns";

interface NotificationParams {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  planName: string;
  retryDate?: Date;
  graceDays?: number;
}

export class NotificationService {
  /**
   * Helper to write notifications to the database and simulate delivery.
   */
  static async send({
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    amount,
    planName,
    retryDate,
    graceDays,
  }: NotificationParams, type: NotificationType): Promise<void> {
    const formattedAmount = new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

    let title = "";
    let message = "";
    let channels: NotificationChannel[] = [];

    switch (type) {
      case "payment_success":
        title = "Payment Successful";
        message = `Dear ${customerName}, your subscription payment of ${formattedAmount} for ${planName} was successful. Thank you for your business.`;
        channels = ["whatsapp", "email"];
        break;

      case "payment_failed":
        title = "Payment Failed";
        message = `Dear ${customerName}, we tried charging your card ${formattedAmount} for your ${planName} subscription, but it was declined. We will try again shortly.`;
        channels = ["sms"];
        break;

      case "grace_warning":
        title = "Grace Mode Activated";
        message = `Hi ${customerName}, your payment of ${formattedAmount} for ${planName} failed. We have activated Grace Mode. Essential services (lights & charging) will continue for ${graceDays || 5} days while we resolve this.`;
        channels = ["whatsapp", "sms"];
        break;

      case "retry_alert":
        const dateStr = retryDate ? format(retryDate, "do 'of' MMMM") : "soon";
        title = "Payment Retry Scheduled";
        message = `Dear ${customerName}, your failed subscription payment is scheduled for retry on ${dateStr} (optimized for salary cycle). Please ensure your account is funded.`;
        channels = ["whatsapp"];
        break;

      case "service_restored":
        title = "Full Service Restored";
        message = `Great news ${customerName}! Your payment has been received, and full service for ${planName} has been restored. All appliances are now active.`;
        channels = ["whatsapp", "email", "sms"];
        break;

      case "payment_reminder":
        title = "Upcoming Subscription Renewal";
        message = `Hi ${customerName}, your ${planName} subscription renews in 3 days. We will charge ${formattedAmount} to your linked card on file.`;
        channels = ["email"];
        break;

      default:
        title = "Notification";
        message = `Hello ${customerName}, this is an update regarding your ${planName} service.`;
        channels = ["sms"];
    }

    // Batch write all channel notifications in a single DB call
    await db.notification.createMany({
      data: channels.map((channel) => ({
        customerId,
        channel,
        type,
        title: `${title} (${channel.toUpperCase()})`,
        message,
      })),
    });

    // Console log to simulate webhook/API call to SMS/WhatsApp gateway
    console.log(`[Notification Engine] Sent ${type.toUpperCase()} to ${customerName} via ${channels.join(", ")}: "${message}"`);
  }
}
