"use client";

import {
  Lightning,
  ShieldCheck,
  ArrowsClockwise,
  XCircle,
  CheckCircle,
  CreditCard,
  Bell,
  WarningOctagon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

interface SubscriptionEvent {
  id: string;
  type: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  description?: string | null;
  metadata?: string | null;
  createdAt: Date;
}

interface SubscriptionLifecycleProps {
  events: SubscriptionEvent[];
}

const EVENT_CONFIG: Record<string, {
  icon: React.ComponentType<{ size?: number; weight?: "fill" | "bold" }>;
  color: string;
  bg: string;
  label: string;
}> = {
  payment_success: {
    icon: CheckCircle,
    color: "var(--color-success)",
    bg: "var(--color-success-light)",
    label: "Payment Successful",
  },
  payment_failed: {
    icon: XCircle,
    color: "var(--color-danger)",
    bg: "var(--color-danger-light)",
    label: "Payment Failed",
  },
  grace_entered: {
    icon: ShieldCheck,
    color: "var(--color-warning)",
    bg: "var(--color-warning-light)",
    label: "Grace Mode Entered",
  },
  retry_scheduled: {
    icon: ArrowsClockwise,
    color: "var(--color-info)",
    bg: "var(--color-info-light)",
    label: "Retry Scheduled",
  },
  service_restored: {
    icon: Lightning,
    color: "var(--color-success)",
    bg: "var(--color-success-light)",
    label: "Service Restored",
  },
  service_suspended: {
    icon: WarningOctagon,
    color: "var(--color-danger)",
    bg: "var(--color-danger-light)",
    label: "Service Suspended",
  },
  status_change: {
    icon: ArrowsClockwise,
    color: "var(--color-text-secondary)",
    bg: "var(--color-bg-secondary)",
    label: "Status Change",
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: "var(--color-text-secondary)",
  bg: "var(--color-bg-secondary)",
  label: "Event",
};

export function SubscriptionLifecycle({ events }: SubscriptionLifecycleProps) {
  if (events.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--color-text-tertiary)",
          fontSize: "0.8125rem",
        }}
      >
        <Lightning size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
        <p>No lifecycle events recorded yet</p>
      </div>
    );
  }

  // Events should be newest first (already sorted by createdAt desc from the server)
  return (
    <div style={{ position: "relative", paddingLeft: "24px" }}>
      {/* Vertical connector line */}
      <div
        style={{
          position: "absolute",
          left: "11px",
          top: "8px",
          bottom: "8px",
          width: "2px",
          background: "var(--color-border)",
          borderRadius: "1px",
        }}
      />

      {events.map((event, index) => {
        const config = EVENT_CONFIG[event.type] || DEFAULT_CONFIG;
        const Icon = config.icon;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            style={{
              position: "relative",
              paddingBottom: index < events.length - 1 ? "4px" : "0",
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                position: "absolute",
                left: "-20px",
                top: "12px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: config.bg,
                border: `2px solid ${config.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <Icon size={10} weight="fill" />
            </div>

            {/* Content */}
            <div
              style={{
                marginLeft: "8px",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-bg-secondary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                    {config.label}
                  </span>
                  {event.fromStatus && event.toStatus && event.fromStatus !== event.toStatus && (
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                      {event.fromStatus} → {event.toStatus}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                </span>
              </div>

              {event.description && (
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", margin: "4px 0 0", lineHeight: 1.4 }}>
                  {event.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
