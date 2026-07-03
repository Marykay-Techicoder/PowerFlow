"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lightning,
  CreditCard,
  Checks,
  Warning,
  Hourglass,
  Calendar,
  Key,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react";
import { simulatePaymentSuccess } from "@/app/actions/subscription-actions";
import { toast } from "sonner";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  healthScore: number;
  subscriptions: {
    id: string;
    status: string;
    billingCycle: string;
    nextBillingDate: Date;
    graceExpiresAt?: Date | null;
    serviceLevel: number;
    plan: {
      name: string;
      amount: number;
      features: string;
    };
    retries?: {
      id: string;
      attemptNumber: number;
      scheduledAt: Date;
      status: string;
      strategy: string;
      reasoning: string;
      executedAt: Date | null;
    }[];
  }[];
}

interface CustomerClientProps {
  customer: Customer;
}

export function CustomerClient({ customer }: CustomerClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const sub = customer.subscriptions?.[0];
  const features = sub ? JSON.parse(sub.plan.features) : [];

  const handlePayNow = async () => {
    if (!sub) return;
    setIsProcessing(true);
    toast.info("Initiating payment checkout...");

    try {
      const res = await simulatePaymentSuccess(sub.id);
      if (res.success) {
        toast.success("Payment succeeded! Full service restored.");
        router.refresh();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (e) {
      toast.error("Error processing transaction");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBanner = (status: string) => {
    switch (status) {
      case "active":
      case "restored":
        return (
          <div
            style={{
              background: "var(--color-success-light)",
              color: "var(--color-success)",
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid rgba(45, 138, 78, 0.2)",
            }}
          >
            <Checks size={24} weight="bold" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Service Status: Active</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                All appliances are functioning at 100% capacity.
              </div>
            </div>
          </div>
        );

      case "grace":
      case "retry_scheduled":
        return (
          <div
            style={{
              background: "var(--color-warning-light)",
              color: "var(--color-warning)",
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid rgba(196, 125, 10, 0.2)",
            }}
          >
            <Hourglass size={24} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Service Status: Grace Mode (50% Power)</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                Your payment of <strong>₦{sub?.plan.amount.toLocaleString()}</strong> failed. To prevent complete blackout,
                essential appliances (lights & charging) remain active. We will automatically retry your card around payday
                to restore service.
              </div>
            </div>
          </div>
        );

      case "suspended":
        return (
          <div
            style={{
              background: "var(--color-danger-light)",
              color: "var(--color-danger)",
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "1px solid rgba(196, 50, 10, 0.2)",
            }}
          >
            <Warning size={24} />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Service Status: Suspended (0% Power)</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                All services have been suspended due to unresolved payments. Update your billing card or click "Pay Now" below to immediately restore service.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Welcome Message */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Welcome, {customer.name}</h1>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
          Manage your subscription plan, invoices, and service connections.
        </p>
      </div>

      {sub ? (
        <div>
          {/* Status banner */}
          {getStatusBanner(sub.status)}

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px", alignItems: "start" }}>
            {/* Left side: Subscription Details & Recovery Schedule */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--color-text-tertiary)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                    }}
                  >
                    CURRENT ACTIVE SERVICE
                  </span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "4px" }}>{sub.plan.name}</h2>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginTop: "2px" }}>
                    ₦{sub.plan.amount.toLocaleString()} billed monthly
                  </div>
                </div>

                {/* Service Details info */}
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
                  <h4 style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "12px" }}>
                    Included Appliances:
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {features.map((f: string) => {
                      const isGraceActive = sub.status === "grace" || sub.status === "retry_scheduled";
                      const isEssential = f.includes("Light") || f.includes("Charger");
                      const isFeatureWorking = !isGraceActive || isEssential;

                      return (
                        <span
                          key={f}
                          className="badge"
                          style={{
                            background: isFeatureWorking ? "var(--color-success-light)" : "var(--color-bg-secondary)",
                            color: isFeatureWorking ? "var(--color-success)" : "var(--color-text-tertiary)",
                            border: `1px solid ${isFeatureWorking ? "rgba(45, 138, 78, 0.15)" : "var(--color-border)"}`,
                          }}
                        >
                          {f}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Next renewal details */}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                  }}
                >
                  <Calendar size={18} color="var(--color-text-secondary)" />
                  <span>
                    Next billing date: <strong>{format(new Date(sub.nextBillingDate), "MMMM d, yyyy")}</strong>
                  </span>
                </div>
              </div>

              {/* Smart Recovery Retry Schedule */}
              {sub.status !== "active" && sub.status !== "restored" && sub.retries && sub.retries.length > 0 && (
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-tertiary)",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Smart Payment Recovery Timeline
                    </span>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <ArrowsClockwise size={20} color="var(--color-accent)" style={{ animation: sub.status === "retry_scheduled" ? "spin 4s linear infinite" : "none" }} />
                      Smart Retry Schedule
                    </h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "20px", borderLeft: "2px solid var(--color-border)", paddingLeft: "16px", marginLeft: "8px", paddingTop: "4px" }}>
                    {sub.retries.map((retry) => {
                      const isExecuted = retry.executedAt !== null || retry.status === "success" || retry.status === "failed";
                      const isSuccess = retry.status === "success";
                      const isFailed = retry.status === "failed";
                      
                      let statusColor = "var(--color-text-tertiary)";
                      let statusBg = "var(--color-bg-secondary)";
                      let statusText = "Scheduled";

                      if (isSuccess) {
                        statusColor = "var(--color-success)";
                        statusBg = "var(--color-success-light)";
                        statusText = "Recovered";
                      } else if (isFailed) {
                        statusColor = "var(--color-danger)";
                        statusBg = "var(--color-danger-light)";
                        statusText = "Failed";
                      } else if (retry.status === "cancelled") {
                        statusColor = "var(--color-text-tertiary)";
                        statusBg = "var(--color-bg-secondary)";
                        statusText = "Cancelled";
                      } else {
                        statusColor = "var(--color-accent)";
                        statusBg = "var(--color-accent-light)";
                        statusText = "Pending Retry";
                      }

                      return (
                        <div key={retry.id} style={{ position: "relative" }}>
                          {/* Circle marker on the left border */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-25px",
                              top: "4px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: isSuccess 
                                ? "var(--color-success)" 
                                : isFailed 
                                ? "var(--color-danger)" 
                                : retry.status === "cancelled"
                                ? "var(--color-border)"
                                : "var(--color-accent)",
                              border: "3px solid var(--color-bg)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          />

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                Attempt #{retry.attemptNumber}
                                <span className="badge" style={{ background: statusBg, color: statusColor, padding: "2px 6px", fontSize: "0.6875rem" }}>
                                  {statusText}
                                </span>
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                                Scheduled for: <strong>{format(new Date(retry.scheduledAt), "MMM d, yyyy h:mm a")}</strong>
                              </div>
                              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", margin: "6px 0 0 0", lineHeight: 1.4 }}>
                                {retry.reasoning}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Payments / Bill Center */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Payment Card panel */}
              <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={20} color="var(--color-accent)" />
                  Billing Card
                </h3>

                <div
                  style={{
                    background: "var(--color-bg-sidebar)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>•••• •••• •••• 4242</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                      Expires 12/28
                    </div>
                  </div>
                  <span className="badge badge-success">Saved</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handlePayNow}
                    disabled={isProcessing || sub.status === "active" || sub.status === "restored"}
                    style={{ width: "100%" }}
                  >
                    {isProcessing ? "Processing..." : "Retry Payment Now"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowCardModal(true)}
                    style={{ width: "100%" }}
                  >
                    Update Payment Method
                  </button>
                </div>
              </div>

              {/* Billing Health rating */}
              <div className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                    YOUR BILLING SCORE
                  </div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "2px" }}>
                    {customer.healthScore} / 100
                  </div>
                </div>
                <span
                  className={`badge ${
                    customer.healthScore >= 80
                      ? "badge-success"
                      : customer.healthScore >= 60
                      ? "badge-info"
                      : customer.healthScore >= 40
                      ? "badge-warning"
                      : "badge-danger"
                  }`}
                  style={{ padding: "4px 8px" }}
                >
                  {customer.healthScore >= 80
                    ? "Excellent Standing"
                    : customer.healthScore >= 60
                    ? "Good Standing"
                    : customer.healthScore >= 40
                    ? "At Risk"
                    : "Critical"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <h2>No subscription plan found</h2>
          <p>Please contact your utility provider to assign a service plan.</p>
        </div>
      )}

      {/* Card Update Mock Modal */}
      {showCardModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "var(--color-bg-overlay)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "420px",
              padding: "24px",
              position: "relative",
              background: "var(--color-bg)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={20} color="var(--color-accent)" />
              Update Payment Card
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
              We will verify the card via a temporary ₦100 authorization hold through Nomba Checkout.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Cardholder Name
                </label>
                <input type="text" className="input" defaultValue={customer.name} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Card Details (Nomba Secure Portal)
                </label>
                <input type="text" className="input" placeholder="4242 4242 4242 4242" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                    Expiry Date
                  </label>
                  <input type="text" className="input" placeholder="MM/YY" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                    CVV
                  </label>
                  <input type="password" className="input" placeholder="•••" />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    toast.success("Card updated and tokenized via Nomba!");
                    setShowCardModal(false);
                    if (sub && sub.status !== "active") {
                      // auto restore service on update
                      await handlePayNow();
                    }
                  }}
                >
                  Verify and Save Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
