"use client";

import { useState } from "react";
import {
  Users,
  CurrencyDollar,
  ShieldCheck,
  ChartLineUp,
  ArrowUp,
  ArrowDown,
  Play,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  Clock,
  CalendarCheck,
  X,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface EventItem {
  id: string;
  type: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  description?: string | null;
  createdAt: Date;
  subscription: {
    customer: {
      name: string;
    };
  };
}

interface OverviewClientProps {
  activeCount: number;
  graceCount: number;
  totalMmr: number;
  successRate: number;
  recentEvents: EventItem[];
}

interface DemoStep {
  title: string;
  description: string;
  status: "active" | "grace" | "suspended" | "restored";
  powerLevel: number;
  icon: React.ReactNode;
  color: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    title: "Monthly Billing Cycle Triggered",
    description: "The billing engine attempts to charge ₦45,000 monthly subscription to the customer's linked card.",
    status: "active",
    powerLevel: 100,
    icon: <CurrencyDollar size={24} weight="bold" />,
    color: "var(--color-accent)",
  },
  {
    title: "Card Payment Declined: Insufficient Funds",
    description: "The payment fails. Traditional utility billing platforms would immediately cut off services, causing customer churn.",
    status: "active",
    powerLevel: 100,
    icon: <XCircle size={24} weight="fill" />,
    color: "var(--color-danger)",
  },
  {
    title: "Grace Mode Activated: Essential Power Maintained",
    description: "PowerFlow acts as a buffer. The customer enters Grace Mode: heavy appliances (AC, heater) are disabled, but essential services (lights, phone charging) continue.",
    status: "grace",
    powerLevel: 50,
    icon: <ShieldCheck size={24} weight="fill" />,
    color: "var(--color-warning)",
  },
  {
    title: "Retry #1: Same-Day Immediate Gateway Recovery",
    description: "The retry engine automatically attempts recovery 4 hours later to capture temporary network fixes. Still insufficient funds.",
    status: "grace",
    powerLevel: 50,
    icon: <ArrowsClockwise size={24} weight="bold" />,
    color: "var(--color-text-secondary)",
  },
  {
    title: "Retry #2: Optimized for Salary Deposit Cycle",
    description: "The engine schedules the second attempt for the 25th of the month. Typical Nigerian payday deposit captured! Payment successful.",
    status: "grace",
    powerLevel: 50,
    icon: <CalendarCheck size={24} weight="fill" />,
    color: "#25D366",
  },
  {
    title: "Full Utility Service Restored",
    description: "Full service level is restored to 100%. All appliances re-enabled. Churn prevented, ₦45,000 collected automatically.",
    status: "restored",
    powerLevel: 100,
    icon: <Lightning size={24} weight="fill" />,
    color: "var(--color-success)",
  },
];

export function OverviewClient({ activeCount, graceCount, totalMmr, successRate, recentEvents }: OverviewClientProps) {
  const [demoActive, setDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startDemo = () => {
    setDemoActive(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setDemoActive(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "service_restored":
      case "payment_success":
        return <Lightning size={14} weight="fill" color="var(--color-success)" />;
      case "grace_entered":
        return <ShieldCheck size={14} weight="fill" color="var(--color-warning)" />;
      case "service_suspended":
        return <XCircle size={14} weight="fill" color="var(--color-danger)" />;
      default:
        return <ArrowsClockwise size={14} weight="fill" color="var(--color-info)" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "service_restored":
      case "payment_success":
        return "var(--color-success-light)";
      case "grace_entered":
        return "var(--color-warning-light)";
      case "service_suspended":
        return "var(--color-danger-light)";
      default:
        return "var(--color-info-light)";
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Overview</h1>
        <p className="page-description">Real-time status updates and billing lifecycle control center</p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Active Subscriptions
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" }}>{activeCount}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 600 }}>Live Nodes</span>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Monthly Recurring Revenue (MRR)
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
              ₦{(totalMmr / 1000).toFixed(0)}K
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>Active Cycle</span>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            In Grace Mode
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: graceCount > 0 ? "var(--color-warning)" : "inherit" }}>
              {graceCount}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-warning)", fontWeight: 600 }}>
              Retries Queued
            </span>
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 500 }}>
            Payment Success Rate
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-success)" }}>
              {successRate}%
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 600 }}>
              vs 0% Traditional
            </span>
          </div>
        </div>
      </div>

      {/* Demo Card */}
      <div
        className="card"
        style={{
          background: "var(--color-accent)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 28px",
          borderRadius: "var(--radius-lg)",
          marginBottom: "28px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "white", marginBottom: "6px" }}>
            Demonstrate Smart Utility Billing
          </h3>
          <p style={{ fontSize: "0.8125rem", opacity: 0.85, lineHeight: 1.5, maxWidth: "600px" }}>
            Run the interactive subscription recovery demo. Watch in real-time how the simulator regulates power delivery
            while the smart retry engine rescues failed charges.
          </p>
        </div>
        <button
          className="btn"
          style={{
            background: "white",
            color: "var(--color-accent)",
            fontWeight: 600,
            border: "none",
            boxShadow: "var(--shadow-md)",
          }}
          onClick={startDemo}
        >
          <Play size={16} weight="fill" />
          Run Recovery Demo
        </button>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
        
        {/* Revenue Impact comparison */}
        <div className="card">
          <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ChartLineUp size={20} color="var(--color-accent)" />
            Revenue Impact Analysis
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>
                TRADITIONAL BILLING
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-danger)" }}>
                ₦2,430,000
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                Lost to churn after immediate disconnections.
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginBottom: "4px" }}>
                POWERFLOW SYSTEM
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-success)" }}>
                ₦1,944,000
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                Recovered through smart retry schedules & grace buffers.
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "var(--color-success-light)",
              color: "var(--color-success)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ArrowUp size={16} weight="bold" />
            <span>80% revenue recovery rate achieved on sandbox simulation.</span>
          </div>
        </div>

        {/* Recent Events Feed */}
        <div className="card">
          <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "20px" }}>Recent Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "var(--radius-md)",
                      background: getEventColor(event.type),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{event.description}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", marginTop: "2px" }}>
                      Customer: {event.subscription.customer.name} •{" "}
                      {formatDistanceToNow(new Date(event.createdAt))} ago
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-tertiary)", fontSize: "0.8125rem" }}>
                No activities logged yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Demo Overlay Modal */}
      <AnimatePresence>
        {demoActive && (
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
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{
                width: "560px",
                padding: "28px",
                position: "relative",
                background: "var(--color-bg)",
                boxShadow: "var(--shadow-xl)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setDemoActive(false)}
                className="btn-ghost btn-icon btn-sm"
                style={{ position: "absolute", right: "16px", top: "16px" }}
              >
                <X size={16} />
              </button>

              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px" }}>
                Recovery Flow Demo Player
              </h2>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                Step {currentStep + 1} of {DEMO_STEPS.length}
              </span>

              {/* Progress Bar */}
              <div
                style={{
                  height: "4px",
                  background: "var(--color-border)",
                  borderRadius: "2px",
                  margin: "16px 0 24px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "var(--color-accent)",
                    width: `${((currentStep + 1) / DEMO_STEPS.length) * 100}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Active Step Panel */}
              <div
                style={{
                  background: "var(--color-bg-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px",
                  display: "flex",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: `${DEMO_STEPS[currentStep].color}15`,
                    color: DEMO_STEPS[currentStep].color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {DEMO_STEPS[currentStep].icon}
                </div>
                <div>
                  <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "6px" }}>
                    {DEMO_STEPS[currentStep].title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                    {DEMO_STEPS[currentStep].description}
                  </p>
                </div>
              </div>

              {/* Simulation Status indicators */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "28px",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "20px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                    SIMULATED UTILITY STATUS
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>
                    {DEMO_STEPS[currentStep].status === "grace" ? "Grace Mode" : DEMO_STEPS[currentStep].status}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                    HARDWARE POWER CAPACITY
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    {DEMO_STEPS[currentStep].powerLevel}% Power Grid
                  </span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </button>
                <button className="btn btn-primary" onClick={nextStep}>
                  {currentStep === DEMO_STEPS.length - 1 ? "Finish Demo" : "Next Step"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
