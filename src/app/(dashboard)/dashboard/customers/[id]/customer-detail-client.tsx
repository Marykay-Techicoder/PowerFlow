"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretLeft,
  Calendar,
  CreditCard,
  Bell,
  Heart,
  ArrowsClockwise,
  User,
  Plus,
  Coins,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Hourglass,
  Info,
} from "@phosphor-icons/react";
import {
  triggerManualBilling,
  simulatePaymentSuccess,
  simulatePaymentFailure,
  createSubscription,
} from "@/app/actions/subscription-actions";
import { updateCustomer, deleteCustomer } from "@/app/actions/customer-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { RetryTimeline } from "@/components/retry-timeline";
import { SubscriptionLifecycle } from "@/components/subscription-lifecycle";

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  healthScore: number;
  healthGrade: string;
  subscriptions: {
    id: string;
    status: string;
    billingCycle: string;
    nextBillingDate: Date;
    graceStartedAt?: Date | null;
    graceExpiresAt?: Date | null;
    serviceLevel: number;
    retryCount: number;
    plan: {
      id: string;
      name: string;
      amount: number;
      features: string;
      gracePolicy: string;
    };
  }[];
  payments: {
    id: string;
    amount: number;
    status: string;
    failureReason?: string | null;
    orderReference: string;
    nombaTransRef?: string | null;
    createdAt: Date;
  }[];
  notifications: {
    id: string;
    channel: string;
    type: string;
    title: string;
    message: string;
    sentAt: Date;
  }[];
}

interface Plan {
  id: string;
  name: string;
  amount: number;
}

interface RetryData {
  id: string;
  attemptNumber: number;
  scheduledAt: Date;
  executedAt?: Date | null;
  status: string;
  strategy: string;
  reasoning: string;
  amount: number;
}

interface EventData {
  id: string;
  type: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  description?: string | null;
  metadata?: string | null;
  createdAt: Date;
}

interface CustomerDetailClientProps {
  customer: CustomerDetail;
  availablePlans: Plan[];
  retries: RetryData[];
  events: EventData[];
}

export function CustomerDetailClient({ customer: initialCustomer, availablePlans, retries, events }: CustomerDetailClientProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail>(initialCustomer);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAddSub, setShowAddSub] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(availablePlans[0]?.id || "");
  const [failureReason, setFailureReason] = useState("insufficient_funds");

  const sub = customer.subscriptions?.[0];

  const handleManualBilling = async () => {
    if (!sub) return;
    setIsSimulating(true);
    toast.info("Triggering billing charge...");
    try {
      const res = await triggerManualBilling(sub.id);
      if (res.success) {
        toast.success("Billing processed successfully");
        router.refresh();
      } else {
        toast.error("Billing charge failed (expected based on simulated success rate)");
        router.refresh();
      }
    } catch (err) {
      toast.error("Error triggering billing");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!sub) return;
    setIsSimulating(true);
    toast.info("Simulating successful card payment...");
    try {
      const res = await simulatePaymentSuccess(sub.id);
      if (res.success) {
        toast.success("Simulated payment SUCCESS: Service restored!");
        router.refresh();
      } else {
        toast.error("Simulation failed");
      }
    } catch (err) {
      toast.error("Error running simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!sub) return;
    setIsSimulating(true);
    toast.info(`Simulating payment FAILURE (${failureReason})...`);
    try {
      const res = await simulatePaymentFailure(sub.id, failureReason);
      toast.success("Simulated payment FAILURE: Retry/Grace engine triggered!");
      router.refresh();
    } catch (err) {
      toast.error("Error running simulation");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCreateSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsSimulating(true);
    try {
      const res = await createSubscription({
        customerId: customer.id,
        planId: selectedPlanId,
      });

      if (res.success) {
        toast.success("Subscription created and first billing run!");
        setShowAddSub(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create subscription");
      }
    } catch (err) {
      toast.error("Error creating subscription");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This cannot be undone.")) return;

    try {
      const res = await deleteCustomer(customer.id);
      if (res.success) {
        toast.success("Customer deleted");
        router.push("/dashboard/customers");
      } else {
        toast.error("Failed to delete customer");
      }
    } catch (err) {
      toast.error("Error deleting customer");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">Active</span>;
      case "restored":
        return <span className="badge badge-success">Restored</span>;
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

  const getHealthColor = (grade: string) => {
    if (grade === "excellent") return "var(--color-success)";
    if (grade === "good") return "var(--color-info)";
    if (grade === "at_risk") return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/customers"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          color: "var(--color-text-secondary)",
          textDecoration: "none",
          marginBottom: "16px",
          fontSize: "0.8125rem",
        }}
        className="btn-ghost"
      >
        <CaretLeft size={16} />
        Back to Customers
      </Link>

      {/* Page Header */}
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-description">Customer ID: {customer.id} • Registered on {new Date(initialCustomer.payments[initialCustomer.payments.length - 1]?.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={handleDelete}>
            Delete Customer
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "28px", alignItems: "start" }}>
        
        {/* Main Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Subscription details */}
          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <CreditCard size={20} color="var(--color-accent)" />
              Subscription Status
            </h3>

            {sub ? (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    background: "var(--color-bg-secondary)",
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>PLAN</div>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{sub.plan.name}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                      ₦{sub.plan.amount.toLocaleString()} / month
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>STATUS</div>
                    <div style={{ marginTop: "4px" }}>{getStatusBadge(sub.status)}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div>
                    <span style={{ color: "var(--color-text-secondary)" }}>Next Billing Cycle: </span>
                    <strong style={{ fontWeight: 500 }}>
                      {format(new Date(sub.nextBillingDate), "MMMM d, yyyy")}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-secondary)" }}>Service Delivery: </span>
                    <strong
                      style={{
                        color: sub.serviceLevel > 0 ? "var(--color-success)" : "var(--color-danger)",
                        fontWeight: 600,
                      }}
                    >
                      {sub.serviceLevel}% Power Level
                    </strong>
                  </div>
                </div>

                {/* Grace period panel */}
                {sub.status === "grace" && sub.graceExpiresAt && (
                  <div
                    style={{
                      background: "var(--color-warning-light)",
                      border: "1px solid rgba(196, 125, 10, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "24px",
                    }}
                  >
                    <Hourglass size={20} color="var(--color-warning)" />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--color-warning)", fontSize: "0.8125rem" }}>
                        Grace Mode Active
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        Essential features remain available. Subscription will suspend on{" "}
                        {format(new Date(sub.graceExpiresAt), "MMMM d, yyyy")} if payment is not received.
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulation panel */}
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                  <h4 style={{ marginBottom: "12px", fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                    Demo Simulation Actions
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={handleManualBilling}
                      disabled={isSimulating}
                    >
                      <ArrowsClockwise size={14} />
                      Trigger Billing Cycle
                    </button>

                    <button
                      className="btn btn-primary"
                      style={{ background: "var(--color-success)", borderColor: "var(--color-success)" }}
                      onClick={handleSimulateSuccess}
                      disabled={isSimulating}
                    >
                      <CheckCircle size={14} />
                      Simulate Success
                    </button>

                    <div style={{ display: "flex", gap: "4px" }}>
                      <select
                        className="input"
                        style={{ width: "150px", fontSize: "0.75rem", padding: "4px 8px" }}
                        value={failureReason}
                        onChange={(e) => setFailureReason(e.target.value)}
                      >
                        <option value="insufficient_funds">Insufficient Funds</option>
                        <option value="gateway_timeout">Gateway Timeout</option>
                        <option value="bank_decline">Bank Decline</option>
                        <option value="card_expired">Card Expired</option>
                      </select>
                      <button
                        className="btn btn-danger"
                        onClick={handleSimulateFailure}
                        disabled={isSimulating}
                      >
                        <XCircle size={14} />
                        Simulate Failure
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 0" }}>
                <div className="empty-state" style={{ padding: "24px 0", marginBottom: "16px" }}>
                  <Coins size={40} className="empty-state-icon" />
                  <p className="empty-state-title">No Active Subscription</p>
                  <p className="empty-state-description">This customer is not subscribed to any utility services.</p>
                </div>
                {showAddSub ? (
                  <form onSubmit={handleCreateSub} style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "4px" }}>
                        Choose service plan:
                      </label>
                      <select
                        className="input"
                        value={selectedPlanId}
                        onChange={(e) => setSelectedPlanId(e.target.value)}
                      >
                        {availablePlans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₦{p.amount.toLocaleString()} / month
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSimulating}>
                      Setup Plan
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddSub(false)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowAddSub(true)}>
                    <Plus size={16} />
                    Assign Service Plan
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment History */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px 10px" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Coins size={20} color="var(--color-accent)" />
                Invoices & Payment Log
              </h3>
            </div>
            {customer.payments.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{p.orderReference}</td>
                      <td style={{ fontWeight: 600 }}>₦{p.amount.toLocaleString()}</td>
                      <td>
                        {p.status === "success" && <span className="badge badge-success">Success</span>}
                        {p.status === "failed" && <span className="badge badge-danger">Failed</span>}
                        {p.status === "pending" && <span className="badge badge-neutral">Pending</span>}
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {p.status === "failed" && p.failureReason && (
                          <span style={{ color: "var(--color-danger)" }}>
                            Decline: {p.failureReason.replace("_", " ")}
                          </span>
                        )}
                        {p.status === "success" && p.nombaTransRef && (
                          <span>Txn: {p.nombaTransRef}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state" style={{ padding: "32px" }}>
                <Coins size={36} className="empty-state-icon" />
                <p className="empty-state-title">No transactions yet</p>
                <p className="empty-state-description">Billing logs will populate once payments are triggered.</p>
              </div>
            )}
          </div>

          {/* Retry Timeline */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <ArrowsClockwise size={20} color="var(--color-accent)" />
              Smart Retry Timeline
            </h3>
            <RetryTimeline retries={retries} />
          </div>

          {/* Subscription Lifecycle */}
          <div className="card" style={{ padding: "20px 24px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Calendar size={20} color="var(--color-accent)" />
              Subscription Lifecycle
            </h3>
            <SubscriptionLifecycle events={events} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Health Score Meter */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heart size={20} color={getHealthColor(customer.healthGrade)} weight="fill" />
              Billing Health
            </h3>
            
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: getHealthColor(customer.healthGrade),
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {customer.healthScore}
              </div>
              <div
                style={{
                  display: "inline-flex",
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-full)",
                  background: `${getHealthColor(customer.healthGrade)}15`,
                  color: getHealthColor(customer.healthGrade),
                }}
              >
                {customer.healthGrade.replace("_", " ")} Grade
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
              <div style={{ display: "flex", gap: "6px", fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>
                  Calculated from payment success rate, retries needed, and payment consistency.
                  Affects grace period length (1-7 days).
                </span>
              </div>
            </div>
          </div>

          {/* Customer Notifications Center */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Bell size={20} color="var(--color-accent)" />
              Sent Communications
            </h3>
            {customer.notifications.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
                {customer.notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "10px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-secondary)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {n.channel} • {n.type.replace("_", " ")}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                        {format(new Date(n.sentAt), "MMM d, H:mm")}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "2px" }}>{n.title}</div>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0", color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }}>
                No notifications logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
