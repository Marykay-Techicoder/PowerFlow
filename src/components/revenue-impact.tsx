"use client";

import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Users,
  ArrowsClockwise,
  Lightning,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface RevenueImpactProps {
  /** Total active subscriptions generating revenue */
  activeSubscriptions: number;
  /** Total subscriptions currently in grace/retry */
  atRiskSubscriptions: number;
  /** Total suspended subscriptions */
  suspendedSubscriptions: number;
  /** Monthly revenue from all active plans */
  totalMrr: number;
  /** Revenue at risk from grace/retry subscriptions */
  atRiskRevenue: number;
  /** Revenue already lost from suspended subscriptions */
  lostRevenue: number;
  /** Total payments recovered via retry engine */
  recoveredPayments: number;
  /** Total recovered revenue amount */
  recoveredRevenue: number;
}

export function RevenueImpactCalculator({
  activeSubscriptions,
  atRiskSubscriptions,
  suspendedSubscriptions,
  totalMrr,
  atRiskRevenue,
  lostRevenue,
  recoveredPayments,
  recoveredRevenue,
}: RevenueImpactProps) {
  const traditionalLoss = atRiskRevenue + lostRevenue;
  const powerflowRecovery = recoveredRevenue;
  const recoveryRate = traditionalLoss > 0 ? Math.round((powerflowRecovery / traditionalLoss) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header comparison */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        {/* Without PowerFlow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            background: "var(--color-danger-light)",
            border: "1px solid rgba(196, 50, 10, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendDown size={18} color="var(--color-danger)" weight="bold" />
            <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-danger)" }}>
              Without PowerFlow
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            Traditional billing: instant disconnection on payment failure
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontWeight: 600, marginBottom: "2px" }}>
              MONTHLY REVENUE LOST
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-danger)", letterSpacing: "-0.03em" }}>
              ₦{traditionalLoss.toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            <span>{atRiskSubscriptions + suspendedSubscriptions} customers churned</span>
            <span>0% recovery</span>
          </div>
        </motion.div>

        {/* VS divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-text-tertiary)",
          }}
        >
          VS
        </div>

        {/* With PowerFlow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
          style={{
            background: "var(--color-success-light)",
            border: "1px solid rgba(45, 138, 78, 0.15)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendUp size={18} color="var(--color-success)" weight="bold" />
            <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-success)" }}>
              With PowerFlow
            </span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            Grace Mode + Smart Retry = retained customers
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontWeight: 600, marginBottom: "2px" }}>
              REVENUE RECOVERED
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-success)", letterSpacing: "-0.03em" }}>
              ₦{powerflowRecovery.toLocaleString()}
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            <span>{recoveredPayments} payments recovered</span>
            <span>{recoveryRate}% recovery rate</span>
          </div>
        </motion.div>
      </div>

      {/* Metric breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {[
          {
            label: "Active MRR",
            value: `₦${(totalMrr / 1000).toFixed(0)}K`,
            subtext: `${activeSubscriptions} subscriptions`,
            icon: CurrencyDollar,
            color: "var(--color-accent)",
          },
          {
            label: "At-Risk Revenue",
            value: `₦${(atRiskRevenue / 1000).toFixed(0)}K`,
            subtext: `${atRiskSubscriptions} in grace/retry`,
            icon: ArrowsClockwise,
            color: "var(--color-warning)",
          },
          {
            label: "Recovered Revenue",
            value: `₦${(recoveredRevenue / 1000).toFixed(0)}K`,
            subtext: `${recoveredPayments} payments saved`,
            icon: Lightning,
            color: "var(--color-success)",
          },
          {
            label: "Lost Revenue",
            value: `₦${(lostRevenue / 1000).toFixed(0)}K`,
            subtext: `${suspendedSubscriptions} suspended`,
            icon: Users,
            color: "var(--color-danger)",
          },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            style={{
              padding: "14px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <metric.icon size={14} color={metric.color} weight="bold" />
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                {metric.label.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
              {metric.value}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
              {metric.subtext}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Annual projection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          padding: "16px 20px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-accent-light)",
          border: "1px solid rgba(44, 90, 237, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 600, marginBottom: "2px" }}>
            PROJECTED ANNUAL IMPACT
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
            At current recovery rates, PowerFlow saves your business:
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-accent)", letterSpacing: "-0.03em" }}>
            ₦{((powerflowRecovery * 12) / 1_000_000).toFixed(1)}M
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>per year</div>
        </div>
      </motion.div>
    </div>
  );
}
