"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowsClockwise,
  MagnifyingGlass,
  Funnel,
  ArrowRight,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface Subscription {
  id: string;
  customerId: string;
  status: string;
  billingCycle: string;
  nextBillingDate: Date;
  serviceLevel: number;
  retryCount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  plan: {
    name: string;
    amount: number;
  };
}

interface SubscriptionListClientProps {
  initialSubscriptions: Subscription[];
}

export function SubscriptionListClient({ initialSubscriptions }: SubscriptionListClientProps) {
  const [subscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      sub.plan.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "restored":
        return <span className="badge badge-success">Active</span>;
      case "grace":
        return <span className="badge badge-warning">Grace Mode</span>;
      case "retry_scheduled":
        return <span className="badge badge-info">Retry Scheduled</span>;
      case "suspended":
        return <span className="badge badge-danger">Suspended</span>;
      default:
        return <span className="badge badge-neutral">Inactive</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h1 className="page-title">Subscriptions</h1>
        <p className="page-description">Monitor subscription statuses, grace periods, and service levels</p>
      </div>

      {/* Controls Card */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <MagnifyingGlass size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search subscriptions by customer name or plan name…"
            className="input"
            style={{ paddingLeft: "36px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Funnel size={16} color="var(--color-text-secondary)" />
          <select
            className="input"
            style={{ width: "180px", padding: "6px 12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="grace">Grace Mode</option>
            <option value="retry_scheduled">Retry Scheduled</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredSubs.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service Plan</th>
                <th>Billing Cycle</th>
                <th>Next Billing Date</th>
                <th>Status</th>
                <th>Service Level</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    <Link
                      href={`/dashboard/customers/${sub.customerId}`}
                      style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}
                    >
                      {sub.customer.name}
                    </Link>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>{sub.customer.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{sub.plan.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                      ₦{sub.plan.amount.toLocaleString()} / month
                    </div>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{sub.billingCycle}</td>
                  <td>{format(new Date(sub.nextBillingDate), "MMM d, yyyy")}</td>
                  <td>{getStatusBadge(sub.status)}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span
                        style={{
                          fontWeight: 600,
                          color: sub.serviceLevel > 0 ? "var(--color-success)" : "var(--color-danger)",
                        }}
                      >
                        {sub.serviceLevel}%
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {sub.serviceLevel === 100 && "Full Power"}
                        {sub.serviceLevel === 50 && "Grace Power"}
                        {sub.serviceLevel === 0 && "Suspended"}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link
                      href={`/dashboard/customers/${sub.customerId}`}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      Manage
                      <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <ArrowsClockwise size={48} className="empty-state-icon" />
            <p className="empty-state-title">No subscriptions found</p>
            <p className="empty-state-description">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
