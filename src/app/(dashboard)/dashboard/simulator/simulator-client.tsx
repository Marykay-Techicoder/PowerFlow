"use client";

import { useState, useEffect, useCallback } from "react";
import { useSimulatorStore } from "@/stores/simulator-store";
import {
  Lightning,
  Lightbulb,
  Fan,
  Television,
  Snowflake,
  Drop,
  CookingPot,
  DeviceMobile,
  Plug,
  CaretRight,
  ShieldWarning,
  Power,
  Buildings,
  Play,
  Stop,
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  CalendarCheck,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; weight?: "fill" | "regular" | "bold" }>> = {
  Lightbulb: Lightbulb,
  DeviceMobile: DeviceMobile,
  Fan: Fan,
  Television: Television,
  Thermometer: Drop,
  Snowflake: Snowflake,
  Drop: Drop,
  CookingPot: CookingPot,
};

const DEMO_SCENARIO = [
  { title: "Monthly Billing Triggered", desc: "Charging ₦45,000 to customer's tokenized card...", action: "active" as const, duration: 2500, icon: Lightning },
  { title: "Payment Declined", desc: "Card charge failed — Insufficient funds. Traditional systems would cut power now.", action: "active" as const, duration: 3000, icon: XCircle },
  { title: "Grace Mode Activated", desc: "Instead of disconnecting, PowerFlow enters Grace Mode. Essential services stay on.", action: "grace" as const, duration: 3500, icon: ShieldWarning },
  { title: "Retry #1 — Same Day", desc: "Automatic retry 4 hours later. Gateway still returning insufficient funds.", action: "grace" as const, duration: 2500, icon: ArrowsClockwise },
  { title: "Retry #2 — Salary Cycle", desc: "Smart retry scheduled for payday (25th). Salary deposited. Charging...", action: "grace" as const, duration: 3000, icon: CalendarCheck },
  { title: "Payment Successful!", desc: "₦45,000 collected! Smart retry recovered revenue that would have been lost.", action: "grace" as const, duration: 2500, icon: CheckCircle },
  { title: "Full Service Restored", desc: "All appliances re-enabled. Customer retained. Revenue recovered.", action: "restored" as const, duration: 3500, icon: Lightning },
];

export function SimulatorClient() {
  const {
    serviceLevel,
    status,
    appliances,
    setApplianceState,
    applyGraceMode,
    applyFullPower,
    applySuspension,
    resetSimulator,
  } = useSimulatorStore();

  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(-1);

  const totalLoad = appliances.reduce(
    (sum, a) => sum + (a.enabled ? a.powerDraw : 0),
    0
  );

  // Auto-play demo scenario
  useEffect(() => {
    if (!demoRunning || demoStep < 0) return;
    if (demoStep >= DEMO_SCENARIO.length) {
      setDemoRunning(false);
      setDemoStep(-1);
      return;
    }

    const step = DEMO_SCENARIO[demoStep];
    // Apply state change
    if (step.action === "grace") {
      applyGraceMode(["Lights", "Phone Charger", "Ceiling Fan"]);
    } else if (step.action === "restored" || step.action === "active") {
      applyFullPower();
    }

    const timer = setTimeout(() => {
      setDemoStep((prev) => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [demoRunning, demoStep, applyGraceMode, applyFullPower]);

  const startDemo = useCallback(() => {
    resetSimulator();
    setDemoStep(0);
    setDemoRunning(true);
  }, [resetSimulator]);

  const stopDemo = useCallback(() => {
    setDemoRunning(false);
    setDemoStep(-1);
    resetSimulator();
  }, [resetSimulator]);

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <span className="badge badge-success" style={{ padding: "4px 10px" }}>Active (100% Service)</span>;
      case "grace":
        return <span className="badge badge-warning" style={{ padding: "4px 10px" }}>Grace Mode (50% Service)</span>;
      case "suspended":
        return <span className="badge badge-danger" style={{ padding: "4px 10px" }}>Suspended (0% Service)</span>;
      default:
        return <span className="badge badge-success">Active</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">IoT Service Simulator</h1>
        <p className="page-description">Visualize how subscription statuses regulate physical energy distribution to residential solar hardware</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "28px" }}>
        
        {/* Left Column: Interactive Appliances & House */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Smart House Visualizer */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--color-bg-sidebar)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                <Buildings size={18} color="var(--color-accent)" />
                Residential Grid Visualizer
              </span>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Load: <strong>{totalLoad} W</strong>
              </span>
            </div>

            {/* Simulated Smart Building Graphic */}
            <div
              style={{
                height: "240px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* House SVG */}
              <svg
                width="240"
                height="180"
                viewBox="0 0 240 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Roof */}
                <path d="M120 20L30 80H210L120 20Z" fill={status === "suspended" ? "#9b9b9b" : "var(--color-border-active)"} />
                
                {/* Solar Panels on Roof */}
                {status !== "suspended" && (
                  <path d="M70 50L60 70H180L170 50H70Z" fill="var(--color-accent)" opacity={serviceLevel / 100} />
                )}

                {/* House Body */}
                <rect x="40" y="80" width="160" height="90" fill="var(--color-bg-secondary)" stroke="var(--color-border)" strokeWidth="2" />
                
                {/* Door */}
                <rect x="110" y="125" width="20" height="45" fill="var(--color-border-active)" />

                {/* Rooms/Windows */}
                {/* Left Window (Bedroom - Essential) */}
                <rect
                  x="60"
                  y="100"
                  width="30"
                  height="30"
                  rx="4"
                  fill={appliances.find((a) => a.id === "lights")?.enabled ? "#fef08a" : "#4b5563"}
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />
                
                {/* Right Window (Living Room - Non-Essential TV/AC) */}
                <rect
                  x="150"
                  y="100"
                  width="30"
                  height="30"
                  rx="4"
                  fill={
                    appliances.find((a) => a.id === "tv")?.enabled ||
                    appliances.find((a) => a.id === "ac")?.enabled
                      ? "#fef08a"
                      : "#4b5563"
                  }
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />
              </svg>

              {/* Power Link Status overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  background: "var(--color-bg-secondary)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background:
                      status === "active"
                        ? "var(--color-success)"
                        : status === "grace"
                        ? "var(--color-warning)"
                        : "var(--color-danger)",
                  }}
                />
                Service Level: {serviceLevel}%
              </div>
            </div>
          </div>

          {/* Appliances Grid */}
          <div className="card">
            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "16px" }}>Appliance Power Controls</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {appliances.map((app) => {
                const Icon = ICON_MAP[app.icon] || Plug;
                const isGraceModeLocked = status === "grace" && !app.essential;
                const isSuspendedLocked = status === "suspended";

                return (
                  <div
                    key={app.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border)",
                      background: app.enabled ? "var(--color-accent-light)" : "var(--color-bg)",
                      opacity: isGraceModeLocked || isSuspendedLocked ? 0.5 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          color: app.enabled ? "var(--color-accent)" : "var(--color-text-secondary)",
                        }}
                      >
                        <Icon size={20} weight={app.enabled ? "fill" : "regular"} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{app.name}</div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                          {app.powerDraw}W • {app.essential ? "Essential" : "Heavy Load"}
                        </div>
                      </div>
                    </div>

                    <label className="switch" style={{ position: "relative", display: "inline-block", width: "32px", height: "18px" }}>
                      <input
                        type="checkbox"
                        checked={app.enabled}
                        disabled={isGraceModeLocked || isSuspendedLocked}
                        onChange={(e) => setApplianceState(app.id, e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          cursor: (isGraceModeLocked || isSuspendedLocked) ? "not-allowed" : "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: app.enabled ? "var(--color-accent)" : "var(--color-border-active)",
                          transition: ".2s",
                          borderRadius: "9px",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            content: '""',
                            height: "12px",
                            width: "12px",
                            left: app.enabled ? "16px" : "4px",
                            bottom: "3px",
                            backgroundColor: "white",
                            transition: ".2s",
                            borderRadius: "50%",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Controller & Analytics */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Status Regulator Controller */}
          <div className="card">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Power size={20} color="var(--color-accent)" />
              Simulation Regulator
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontWeight: 600, marginBottom: "4px" }}>
                  CURRENT SIMULATED SYSTEM STATUS
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {getStatusBadge()}
                </div>
              </div>

              {/* Status sliders overrides */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-secondary)" }}>
                  Trigger State Override
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ background: status === "active" ? "var(--color-accent-light)" : "none", color: status === "active" ? "var(--color-accent-text)" : "inherit" }}
                    onClick={applyFullPower}
                  >
                    Active
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ background: status === "grace" ? "var(--color-warning-light)" : "none", color: status === "grace" ? "var(--color-warning)" : "inherit" }}
                    onClick={() => applyGraceMode(["Lights", "Phone Charger", "Ceiling Fan"])}
                  >
                    Grace Mode
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ background: status === "suspended" ? "var(--color-danger-light)" : "none", color: status === "suspended" ? "var(--color-danger)" : "inherit" }}
                    onClick={applySuspension}
                  >
                    Suspension
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-Play Demo */}
            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-secondary)", display: "block", marginBottom: "8px" }}>
                Auto-Play Demo Scenario
              </span>
              {!demoRunning ? (
                <button className="btn btn-primary" style={{ width: "100%" }} onClick={startDemo}>
                  <Play size={16} weight="fill" />
                  Run Recovery Demo
                </button>
              ) : (
                <button className="btn btn-danger" style={{ width: "100%" }} onClick={stopDemo}>
                  <Stop size={16} weight="fill" />
                  Stop Demo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Demo Narration Panel */}
        <AnimatePresence>
          {demoRunning && demoStep >= 0 && demoStep < DEMO_SCENARIO.length && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              style={{ gridColumn: "1 / -1" }}
            >
              <div
                className="card"
                style={{
                  background: "var(--color-accent)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {(() => { const StepIcon = DEMO_SCENARIO[demoStep].icon; return <StepIcon size={24} weight="bold" />; })()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.6875rem", opacity: 0.7, fontWeight: 600, marginBottom: "4px" }}>
                    STEP {demoStep + 1} OF {DEMO_SCENARIO.length}
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "4px" }}>
                    {DEMO_SCENARIO[demoStep].title}
                  </div>
                  <div style={{ fontSize: "0.8125rem", opacity: 0.85, lineHeight: 1.4 }}>
                    {DEMO_SCENARIO[demoStep].desc}
                  </div>
                </div>
                {/* Progress dots */}
                <div style={{ display: "flex", gap: "6px", alignSelf: "center" }}>
                  {DEMO_SCENARIO.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === demoStep ? "24px" : "8px",
                        height: "8px",
                        borderRadius: "4px",
                        background: i <= demoStep ? "white" : "rgba(255,255,255,0.3)",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Grace policy explanation card */}
          <div
            className="card"
            style={{
              background: "var(--color-info-light)",
              border: "1px solid rgba(44, 90, 237, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <h4 style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-accent)" }}>
              <ShieldWarning size={18} />
              What is Smart Grace Mode?
            </h4>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              Traditionally, utility providers disconnect customers immediately upon subscription payment failure.
              This damages customer relations and causes churn.
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
              With <strong>PowerFlow</strong>, the utility hardware registers payment failure and switches the home to
              <strong> Grace Mode</strong>. The system cuts heavy loads (AC, Water Heater) but maintains essential services
              (Lights, Fans, Phone Charging). This keeps the customer connected while the smart retry engine operates.
            </p>
          </div>
        </div>
      </div>
    );
}
