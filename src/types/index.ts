// ─── Subscription Status ────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "grace"
  | "retry_scheduled"
  | "suspended"
  | "restored";

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Active",
  grace: "Grace Mode",
  retry_scheduled: "Retry Scheduled",
  suspended: "Suspended",
  restored: "Restored",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: "success",
  grace: "warning",
  retry_scheduled: "info",
  suspended: "danger",
  restored: "success",
};

// ─── Health Grade ───────────────────────────────────────────

export type HealthGrade = "excellent" | "good" | "at_risk" | "critical";

export const HEALTH_GRADE_LABELS: Record<HealthGrade, string> = {
  excellent: "Excellent",
  good: "Good",
  at_risk: "At Risk",
  critical: "Critical",
};

export const HEALTH_GRADE_COLORS: Record<HealthGrade, string> = {
  excellent: "success",
  good: "info",
  at_risk: "warning",
  critical: "danger",
};

// ─── Payment Status ─────────────────────────────────────────

export type PaymentStatus = "success" | "failed" | "pending";

export type PaymentFailureReason =
  | "insufficient_funds"
  | "gateway_timeout"
  | "bank_decline"
  | "card_expired"
  | null;

export const FAILURE_REASON_LABELS: Record<string, string> = {
  insufficient_funds: "Insufficient Funds",
  gateway_timeout: "Gateway Timeout",
  bank_decline: "Bank Decline",
  card_expired: "Card Expired",
};

// ─── Retry Strategy ─────────────────────────────────────────

export type RetryStrategy = "immediate" | "salary_cycle" | "final_recovery";

export const RETRY_STRATEGY_LABELS: Record<RetryStrategy, string> = {
  immediate: "Same Day",
  salary_cycle: "Salary Cycle",
  final_recovery: "Final Recovery",
};

export type RetryStatus = "scheduled" | "success" | "failed" | "cancelled";

// ─── Utility Type ───────────────────────────────────────────

export type UtilityType = "solar" | "water" | "internet" | "electricity";

export const UTILITY_TYPE_LABELS: Record<UtilityType, string> = {
  solar: "Solar Energy",
  water: "Water Supply",
  internet: "Internet Service",
  electricity: "Estate Electricity",
};

export const UTILITY_TYPE_ICONS: Record<UtilityType, string> = {
  solar: "SunHorizon",
  water: "Drop",
  internet: "WifiHigh",
  electricity: "Lightning",
};

// ─── Notification ───────────────────────────────────────────

export type NotificationChannel = "whatsapp" | "email" | "sms";
export type NotificationType =
  | "payment_reminder"
  | "grace_warning"
  | "retry_alert"
  | "service_restored"
  | "payment_success"
  | "payment_failed";

// ─── Webhook Event Types ────────────────────────────────────

export type WebhookEventType =
  | "payment_success"
  | "payment_failed"
  | "token_created"
  | "payment_reversal";

// ─── Subscription Event Types ───────────────────────────────

export type SubscriptionEventType =
  | "status_change"
  | "payment_success"
  | "payment_failed"
  | "retry_scheduled"
  | "retry_success"
  | "retry_failed"
  | "grace_entered"
  | "grace_expired"
  | "service_restored"
  | "service_suspended";

// ─── Service Level ──────────────────────────────────────────

export interface ServiceLevel {
  percentage: number;
  enabledFeatures: string[];
  disabledFeatures: string[];
}

// ─── Grace Policy ───────────────────────────────────────────

export interface GracePolicy {
  allowed: string[];
  disabled: string[];
}

// ─── Plan Features ──────────────────────────────────────────

export interface PlanFeatures {
  features: string[];
}

// ─── Demo Scenario ──────────────────────────────────────────

export type DemoStep =
  | "idle"
  | "billing_triggered"
  | "payment_success"
  | "payment_failed"
  | "grace_entered"
  | "retry_1_scheduled"
  | "retry_1_failed"
  | "retry_2_scheduled"
  | "retry_2_success"
  | "service_restored"
  | "completed";

export interface DemoScenarioStep {
  id: DemoStep;
  title: string;
  description: string;
  serviceLevel: number;
  status: SubscriptionStatus;
  icon: string;
  duration: number; // milliseconds to show this step
}
