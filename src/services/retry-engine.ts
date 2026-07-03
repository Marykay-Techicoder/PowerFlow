import { db } from "@/lib/db";
import { RETRY_STRATEGIES, MAX_RETRY_ATTEMPTS } from "@/lib/constants";
import type { RetryStrategy, RetryStatus } from "@/types";
import { addHours, addDays, setDate, isAfter, isBefore } from "date-fns";
import { NotificationService } from "./notification-service";

export interface ScheduledRetry {
  attemptNumber: number;
  scheduledAt: Date;
  strategy: RetryStrategy;
  reasoning: string;
  amount: number;
}

export class RetryEngine {
  /**
   * Calculates the next retry schedule based on current retry count and date.
   */
  static calculateSchedule(
    currentRetryCount: number,
    amount: number,
    baseDate: Date = new Date()
  ): ScheduledRetry | null {
    const nextAttempt = currentRetryCount + 1;

    if (nextAttempt > MAX_RETRY_ATTEMPTS) {
      return null;
    }

    const config = RETRY_STRATEGIES[nextAttempt as keyof typeof RETRY_STRATEGIES];
    if (!config) return null;

    let scheduledAt = addHours(baseDate, config.delayHours);
    let reasoning: string = config.reasoning;

    // Apply smart salary-cycle optimization for Retry 2
    if (config.strategy === "salary_cycle") {
      const day = baseDate.getDate();
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();

      // Typical Nigerian salary window is 25th to 28th
      if (day < 25) {
        // Schedule it for the 25th of the current month
        scheduledAt = setDate(baseDate, 25);
        // Set to 9 AM
        scheduledAt.setHours(9, 0, 0, 0);
        reasoning = `Scheduled for the 25th of the month — optimized for typical Nigerian salary deposit cycles to maximize fund availability.`;
      } else if (day >= 25 && day <= 27) {
        // If it failed during the salary window, retry 24 hours later (still within salary window)
        scheduledAt = addDays(baseDate, 1);
        reasoning = `Scheduled for 24 hours from now — remaining within the active salary payment window (25th-28th) to capture incoming deposits.`;
      } else {
        // If after 27th, schedule for the 25th of the NEXT month or fallback to a standard 3 days delay
        // We do a standard 3 days delay since waiting a month is too long for solar providers, but we mention it
        scheduledAt = addDays(baseDate, 3);
        reasoning = `Scheduled in 3 days (standard cycle) — outside current month's salary window, applying optimized recovery buffer.`;
      }
    }

    return {
      attemptNumber: nextAttempt,
      scheduledAt,
      strategy: config.strategy,
      reasoning,
      amount,
    };
  }

  /**
   * Schedules a retry in the database and sends notifications.
   */
  static async scheduleNext(
    subscriptionId: string,
    currentRetryCount: number,
    amount: number
  ): Promise<boolean> {
    const schedule = this.calculateSchedule(currentRetryCount, amount);

    if (!schedule) {
      return false; // No more retries allowed, should suspend
    }

    const sub = await db.subscription.findUnique({
      where: { id: subscriptionId },
      include: { customer: true, plan: true },
    });

    if (!sub) return false;

    // Create the retry attempt in the DB
    await db.retryAttempt.create({
      data: {
        subscriptionId,
        attemptNumber: schedule.attemptNumber,
        scheduledAt: schedule.scheduledAt,
        strategy: schedule.strategy,
        reasoning: schedule.reasoning,
        amount: schedule.amount,
        status: "scheduled",
      },
    });

    // Update the subscription's retry count and status
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        retryCount: schedule.attemptNumber,
        status: "retry_scheduled",
      },
    });

    // Create status change event
    await db.subscriptionEvent.create({
      data: {
        subscriptionId,
        type: "retry_scheduled",
        fromStatus: sub.status,
        toStatus: "retry_scheduled",
        description: `Retry #${schedule.attemptNumber} scheduled for ${schedule.scheduledAt.toLocaleDateString()}. Strategy: ${schedule.strategy}.`,
        metadata: JSON.stringify(schedule),
      },
    });

    // Send notifications to the customer
    await NotificationService.send(
      {
        customerId: sub.customerId,
        customerName: sub.customer.name,
        customerPhone: sub.customer.phone,
        customerEmail: sub.customer.email,
        amount: schedule.amount,
        planName: sub.plan.name,
        retryDate: schedule.scheduledAt,
      },
      "retry_alert"
    );

    return true;
  }
}
