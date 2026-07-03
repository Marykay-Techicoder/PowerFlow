// ─── App Constants ──────────────────────────────────────────

export const APP_NAME = "PowerFlow";
export const APP_DESCRIPTION = "Subscription Billing Infrastructure for Utility Providers";
export const APP_VERSION = "1.0.0";

// ─── Currency ───────────────────────────────────────────────

export const DEFAULT_CURRENCY = "NGN";
export const CURRENCY_SYMBOL = "₦";

// ─── Grace Mode ─────────────────────────────────────────────

export const GRACE_PERIOD_DAYS = {
  excellent: 7,
  good: 5,
  at_risk: 3,
  critical: 1,
} as const;

// ─── Retry Configuration ────────────────────────────────────

export const MAX_RETRY_ATTEMPTS = 3;

export const RETRY_STRATEGIES = {
  1: {
    strategy: "immediate" as const,
    label: "Same Day Retry",
    reasoning: "Immediate retry — temporary network or gateway issues often resolve within hours",
    delayHours: 4,
  },
  2: {
    strategy: "salary_cycle" as const,
    label: "Salary Cycle Retry",
    reasoning: "Scheduled for typical Nigerian salary deposit cycle (25th-27th) — optimized for when customer is most likely to have funds",
    delayHours: 72,
  },
  3: {
    strategy: "final_recovery" as const,
    label: "Final Recovery Attempt",
    reasoning: "Last attempt before service suspension — customer has been notified via WhatsApp and SMS",
    delayHours: 120,
  },
} as const;

// ─── Health Score Weights ───────────────────────────────────

export const HEALTH_SCORE_WEIGHTS = {
  failedPayments: 0.4,
  delayedPayments: 0.2,
  retryCount: 0.25,
  paymentConsistency: 0.15,
} as const;

// ─── Service Levels ─────────────────────────────────────────

export const SERVICE_LEVELS = {
  active: 100,
  grace: 50,
  suspended: 0,
  restored: 100,
} as const;

// ─── Demo Scenario ──────────────────────────────────────────

export const DEMO_SCENARIO_STEPS = [
  {
    id: "billing_triggered" as const,
    title: "Monthly Billing Triggered",
    description: "Subscription billing cycle initiated. Charging ₦45,000 to customer's card.",
    serviceLevel: 100,
    status: "active" as const,
    icon: "CreditCard",
    duration: 2500,
  },
  {
    id: "payment_failed" as const,
    title: "Payment Failed",
    description: "Card charge declined — Insufficient funds. Traditional systems would disconnect immediately.",
    serviceLevel: 100,
    status: "active" as const,
    icon: "XCircle",
    duration: 3000,
  },
  {
    id: "grace_entered" as const,
    title: "Grace Mode Activated",
    description: "Instead of disconnection, customer enters Grace Mode. Essential services remain available — lights and phone charging continue.",
    serviceLevel: 50,
    status: "grace" as const,
    icon: "ShieldCheck",
    duration: 3500,
  },
  {
    id: "retry_1_scheduled" as const,
    title: "Retry 1 — Same Day",
    description: "Smart Retry Engine schedules immediate retry. Temporary gateway issues often resolve within hours.",
    serviceLevel: 50,
    status: "retry_scheduled" as const,
    icon: "ArrowClockwise",
    duration: 2500,
  },
  {
    id: "retry_1_failed" as const,
    title: "Retry 1 Failed",
    description: "First retry unsuccessful — Insufficient funds. Customer health score adjusted. Grace Mode continues.",
    serviceLevel: 50,
    status: "grace" as const,
    icon: "XCircle",
    duration: 3000,
  },
  {
    id: "retry_2_scheduled" as const,
    title: "Retry 2 — Salary Cycle",
    description: "Next retry optimized for Nigerian salary deposit cycle (25th-27th). Customer notified via WhatsApp.",
    serviceLevel: 50,
    status: "retry_scheduled" as const,
    icon: "CalendarCheck",
    duration: 2500,
  },
  {
    id: "retry_2_success" as const,
    title: "Payment Successful!",
    description: "Salary-cycle optimized retry succeeded! ₦45,000 collected. Customer retained, revenue recovered.",
    serviceLevel: 50,
    status: "retry_scheduled" as const,
    icon: "CheckCircle",
    duration: 3000,
  },
  {
    id: "service_restored" as const,
    title: "Full Service Restored",
    description: "All appliances re-enabled. Customer health score updated. Service level back to 100%.",
    serviceLevel: 100,
    status: "restored" as const,
    icon: "Lightning",
    duration: 3500,
  },
  {
    id: "completed" as const,
    title: "Revenue Recovered",
    description: "Without PowerFlow: ₦45,000 lost + customer churned. With PowerFlow: ₦45,000 recovered + customer retained.",
    serviceLevel: 100,
    status: "active" as const,
    icon: "TrendUp",
    duration: 4000,
  },
] as const;

// ─── Navigation ─────────────────────────────────────────────

export const SIDEBAR_NAVIGATION = [
  {
    label: "Overview",
    href: "/",
    icon: "SquaresFour",
    section: "main",
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "Users",
    section: "main",
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: "Repeat",
    section: "main",
  },
  {
    label: "Utility Plans",
    href: "/plans",
    icon: "Package",
    section: "main",
  },
  {
    label: "Billing",
    href: "/billing",
    icon: "Receipt",
    section: "billing",
  },
  {
    label: "Simulator",
    href: "/simulator",
    icon: "Lightning",
    section: "billing",
  },
  {
    label: "Webhooks",
    href: "/webhooks",
    icon: "Plugs",
    section: "system",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: "Bell",
    section: "system",
  },
] as const;

export const SIDEBAR_SECTIONS = {
  main: "Platform",
  billing: "Billing Engine",
  system: "System",
} as const;
