"use client";

import {
  ArrowClockwise,
  CalendarCheck,
  Lightning,
  XCircle,
  CheckCircle,
  Clock,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

interface RetryAttempt {
  id: string;
  attemptNumber: number;
  scheduledAt: Date;
  executedAt?: Date | null;
  status: string;
  strategy: string;
  reasoning: string;
  amount: number;
}

interface RetryTimelineProps {
  retries: RetryAttempt[];
  maxRetries?: number;
}

const STRATEGY_ICONS: Record<string, React.ComponentType<{ size?: number; weight?: "fill" | "bold" | "regular" }>> = {
  immediate: ArrowClockwise,
  salary_cycle: CalendarCheck,
  final_recovery: Lightning,
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ComponentType<{ size?: number; weight?: "fill" | "bold" }> }> = {
  scheduled: { color: "var(--color-info)", bg: "var(--color-info-light)", icon: Clock },
  success: { color: "var(--color-success)", bg: "var(--color-success-light)", icon: CheckCircle },
  failed: { color: "var(--color-danger)", bg: "var(--color-danger-light)", icon: XCircle },
  cancelled: { color: "var(--color-text-tertiary)", bg: "var(--color-bg-secondary)", icon: WarningCircle },
};

export function RetryTimeline({ retries, maxRetries = 3 }: RetryTimelineProps) {
  if (retries.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--color-text-tertiary)",
          fontSize: "0.8125rem",
        }}
      >
        <ArrowClockwise size={32} style={{ marginBottom: "8px", opacity: 0.4 }} />
        <p>No retry attempts for this subscription</p>
      </div>
    );
  }

  const sortedRetries = [...retries].sort((a, b) => a.attemptNumber - b.attemptNumber);

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

      {sortedRetries.map((retry, index) => {
        const config = STATUS_CONFIG[retry.status] || STATUS_CONFIG.scheduled;
        const StrategyIcon = STRATEGY_ICONS[retry.strategy] || ArrowClockwise;
        const StatusIcon = config.icon;

        return (
          <motion.div
            key={retry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              position: "relative",
              paddingBottom: index < sortedRetries.length - 1 ? "20px" : "0",
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                position: "absolute",
                left: "-20px",
                top: "4px",
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
              <StatusIcon size={10} weight="fill" />
            </div>

            {/* Content card */}
            <div
              style={{
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                marginLeft: "8px",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <StrategyIcon size={16} weight="bold" />
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    Retry #{retry.attemptNumber}
                  </span>
                  <span
                    className={`badge badge-${retry.status === "success" ? "success" : retry.status === "failed" ? "danger" : "info"}`}
                    style={{ fontSize: "0.6875rem" }}
                  >
                    {retry.status.charAt(0).toUpperCase() + retry.status.slice(1)}
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                  ₦{retry.amount.toLocaleString()}
                </span>
              </div>

              {/* Strategy reasoning */}
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: "0 0 8px" }}>
                {retry.reasoning}
              </p>

              {/* Timestamps */}
              <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                <span>
                  Scheduled: {format(new Date(retry.scheduledAt), "MMM d, h:mm a")}
                </span>
                {retry.executedAt && (
                  <span>
                    Executed: {format(new Date(retry.executedAt), "MMM d, h:mm a")}
                  </span>
                )}
                <span style={{ marginLeft: "auto" }}>
                  Strategy: <strong style={{ textTransform: "capitalize" }}>{retry.strategy.replace("_", " ")}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Remaining retries indicator */}
      {sortedRetries.length < maxRetries && (
        <div
          style={{
            position: "relative",
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-20px",
              top: "12px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "var(--color-bg-secondary)",
              border: "2px dashed var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          />
          <div
            style={{
              marginLeft: "8px",
              padding: "10px 16px",
              fontSize: "0.75rem",
              color: "var(--color-text-tertiary)",
              fontStyle: "italic",
            }}
          >
            {maxRetries - sortedRetries.length} retry attempt{maxRetries - sortedRetries.length > 1 ? "s" : ""} remaining before suspension
          </div>
        </div>
      )}
    </div>
  );
}
