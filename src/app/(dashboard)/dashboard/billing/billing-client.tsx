"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Receipt,
  ArrowsClockwise,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  DotsThreeVertical,
  Sliders,
  ChartLineUp,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { RevenueImpactCalculator } from "@/components/revenue-impact";

interface Payment {
  id: string;
  amount: number;
  status: string;
  failureReason?: string | null;
  orderReference: string;
  nombaTransRef?: string | null;
  paymentMethod: string;
  createdAt: Date;
  customer: {
    id: string;
    name: string;
  };
  subscription: {
    plan: {
      name: string;
    };
  };
}

interface RetryAttempt {
  id: string;
  attemptNumber: number;
  scheduledAt: Date;
  executedAt?: Date | null;
  status: string;
  failureReason?: string | null;
  strategy: string;
  reasoning: string;
  amount: number;
  subscription: {
    customer: {
      id: string;
      name: string;
    };
    plan: {
      name: string;
    };
  };
}

interface RevenueMetrics {
  activeSubscriptions: number;
  atRiskSubscriptions: number;
  suspendedSubscriptions: number;
  totalMrr: number;
  atRiskRevenue: number;
  lostRevenue: number;
  recoveredPayments: number;
  recoveredRevenue: number;
}

interface BillingClientProps {
  initialPayments: Payment[];
  initialRetries: RetryAttempt[];
  revenueMetrics: RevenueMetrics;
}

export function BillingClient({ initialPayments, initialRetries, revenueMetrics }: BillingClientProps) {
  const [payments] = useState<Payment[]>(initialPayments);
  const [retries] = useState<RetryAttempt[]>(initialRetries);
  const [activeTab, setActiveTab] = useState<"payments" | "retries" | "revenue">("payments");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <span className="badge badge-success">Success</span>;
      case "failed":
        return <span className="badge badge-danger">Failed</span>;
      default:
        return <span className="badge badge-neutral">Pending</span>;
    }
  };

  const getRetryStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <span className="badge badge-success">Succeeded</span>;
      case "failed":
        return <span className="badge badge-danger">Failed</span>;
      case "cancelled":
        return <span className="badge badge-neutral">Cancelled</span>;
      default:
        return <span className="badge badge-info">Scheduled</span>;
    }
  };

  const getStrategyBadge = (strategy: string) => {
    switch (strategy) {
      case "immediate":
        return (
          <span className="badge badge-neutral" style={{ border: "1px solid var(--color-border)" }}>
            Same Day
          </span>
        );
      case "salary_cycle":
        return (
          <span className="badge badge-warning" style={{ background: "var(--color-warning-light)" }}>
            Salary Optimized
          </span>
        );
      default:
        return (
          <span className="badge badge-danger" style={{ background: "var(--color-danger-light)" }}>
            Final Recovery
          </span>
        );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Billing Ledger</h1>
        <p className="page-description">Review transactions, smart retry queues, and optimization analytics</p>
      </div>

      {/* Tabs Menu */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => setActiveTab("payments")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "payments" ? "2px solid var(--color-accent)" : "2px solid transparent",
            padding: "8px 4px 12px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "payments" ? 600 : 500,
            color: activeTab === "payments" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Receipt size={16} />
          Payment Transactions ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab("retries")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "retries" ? "2px solid var(--color-accent)" : "2px solid transparent",
            padding: "8px 4px 12px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "retries" ? 600 : 500,
            color: activeTab === "retries" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ArrowsClockwise size={16} />
          Smart Retry Queue ({retries.length})
        </button>
        <button
          onClick={() => setActiveTab("revenue")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "revenue" ? "2px solid var(--color-accent)" : "2px solid transparent",
            padding: "8px 4px 12px",
            fontSize: "0.875rem",
            fontWeight: activeTab === "revenue" ? 600 : 500,
            color: activeTab === "revenue" ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ChartLineUp size={16} />
          Revenue Impact
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "payments" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {payments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Reference</th>
                  <th>Plan Charged</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}</td>
                    <td>
                      <Link
                        href={`/dashboard/customers/${p.customer.id}`}
                        style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}
                      >
                        {p.customer.name}
                      </Link>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{p.orderReference}</td>
                    <td>{p.subscription.plan.name}</td>
                    <td style={{ fontWeight: 600 }}>₦{p.amount.toLocaleString()}</td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      {p.status === "failed" && p.failureReason && (
                        <span style={{ color: "var(--color-danger)" }}>
                          Decline reason: {p.failureReason.replace("_", " ")}
                        </span>
                      )}
                      {p.status === "success" && p.nombaTransRef && (
                        <span>Nomba Ref: {p.nombaTransRef}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: "48px 24px" }}>
              <Receipt size={48} className="empty-state-icon" />
              <p className="empty-state-title">No transactions found</p>
              <p className="empty-state-description">Transactions list will populate once customers set up payments.</p>
            </div>
          )}
        </div>
      ) : activeTab === "retries" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {retries.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheduled Date</th>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th>Retry Strategy</th>
                  <th>Attempt</th>
                  <th>Status</th>
                  <th>Engine Reason / Optimization Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {retries.map((r) => (
                  <tr key={r.id}>
                    <td>{format(new Date(r.scheduledAt), "MMM d, yyyy h:mm a")}</td>
                    <td>
                      <Link
                        href={`/dashboard/customers/${r.subscription.customer.id}`}
                        style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}
                      >
                        {r.subscription.customer.name}
                      </Link>
                    </td>
                    <td>{r.subscription.plan.name}</td>
                    <td>{getStrategyBadge(r.strategy)}</td>
                    <td style={{ fontWeight: 600 }}>Attempt #{r.attemptNumber}</td>
                    <td>{getRetryStatusBadge(r.status)}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", maxWidth: "340px", lineHeight: 1.4 }}>
                      {r.reasoning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state" style={{ padding: "48px 24px" }}>
              <ArrowsClockwise size={48} className="empty-state-icon" />
              <p className="empty-state-title">Smart Retry Queue is empty</p>
              <p className="empty-state-description">
                Scheduled retries appear here when payments fail and the smart billing engine schedules recovery.
              </p>
            </div>
          )}
        </div>
      ) : (
        <RevenueImpactCalculator {...revenueMetrics} />
      )}
    </div>
  );
}
