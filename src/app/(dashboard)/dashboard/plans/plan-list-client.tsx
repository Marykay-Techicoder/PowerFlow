"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Sparkle,
  DeviceMobile,
  Lightbulb,
  Fan,
  Television,
  Snowflake,
  Drop,
  WifiHigh,
  Lightning,
} from "@phosphor-icons/react";
import { createPlan, togglePlanActive } from "@/app/actions/plan-actions";
import { toast } from "sonner";
import { UTILITY_TYPE_LABELS, UTILITY_TYPE_ICONS } from "@/types";

interface UtilityPlan {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  amount: number;
  currency: string;
  features: string; // JSON Array
  gracePolicy: string; // JSON Object
  isActive: boolean;
}

interface PlanListClientProps {
  initialPlans: UtilityPlan[];
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; weight?: "fill" | "regular" }>> = {
  solar: Lightning,
  water: Drop,
  internet: WifiHigh,
  electricity: Lightning,
};

export function PlanListClient({ initialPlans }: PlanListClientProps) {
  const [plans, setPlans] = useState<UtilityPlan[]>(initialPlans);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("solar");
  const [amount, setAmount] = useState<number>(30000);
  const [featureInputs, setFeatureInputs] = useState<string[]>(["Lights", "Phone Charger", "Fans"]);
  const [newFeature, setNewFeature] = useState("");
  const [graceAllowedFeatures, setGraceAllowedFeatures] = useState<string[]>(["Lights", "Phone Charger"]);

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    if (featureInputs.includes(newFeature.trim())) {
      toast.error("Feature already exists");
      return;
    }
    setFeatureInputs((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (f: string) => {
    setFeatureInputs((prev) => prev.filter((item) => item !== f));
    setGraceAllowedFeatures((prev) => prev.filter((item) => item !== f));
  };

  const handleToggleGraceFeature = (f: string) => {
    setGraceAllowedFeatures((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0 || featureInputs.length === 0) {
      toast.error("Please configure name, amount and at least one feature");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPlan({
        name,
        description,
        type,
        amount,
        features: featureInputs,
        graceAllowedFeatures,
      });

      if (res.success && res.plan) {
        toast.success("Plan created successfully");
        setPlans((prev) => [res.plan as any, ...prev]);
        setShowAddModal(false);
        // Clear Form
        setName("");
        setDescription("");
        setType("solar");
        setAmount(30000);
        setFeatureInputs(["Lights", "Phone Charger", "Fans"]);
        setGraceAllowedFeatures(["Lights", "Phone Charger"]);
      } else {
        toast.error(res.error || "Failed to create plan");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await togglePlanActive(id, !currentActive);
      if (res.success) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !currentActive } : p))
        );
        toast.success(`Plan ${!currentActive ? "activated" : "deactivated"}`);
      } else {
        toast.error("Failed to toggle plan state");
      }
    } catch (err) {
      toast.error("Error updating plan");
    }
  };

  const getFeaturesList = (plan: UtilityPlan): string[] => {
    try {
      return JSON.parse(plan.features);
    } catch (e) {
      return [];
    }
  };

  const getGraceAllowed = (plan: UtilityPlan): string[] => {
    try {
      return JSON.parse(plan.gracePolicy).allowed || [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Utility Plans</h1>
          <p className="page-description">Configure utility service packages and grace period policies</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} weight="bold" />
          Create Plan
        </button>
      </div>

      {/* Grid of Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {plans.map((plan) => {
          const Icon = TYPE_ICONS[plan.type] || Package;
          const features = getFeaturesList(plan);
          const graceAllowed = getGraceAllowed(plan);

          return (
            <div
              className="card"
              key={plan.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                borderColor: plan.isActive ? "var(--color-border)" : "dashed var(--color-border-hover)",
                opacity: plan.isActive ? 1 : 0.7,
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent)",
                    }}
                  >
                    <Icon size={20} weight="fill" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{plan.name}</h3>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}
                    >
                      {plan.type} package
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(plan.id, plan.isActive)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: "0.6875rem", padding: "2px 6px" }}
                >
                  {plan.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>

              {/* Amount */}
              <div>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  ₦{plan.amount.toLocaleString()}
                </span>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}> / month</span>
              </div>

              {plan.description && (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
                  {plan.description}
                </p>
              )}

              {/* Grace Policy Section */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginTop: "4px" }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-warning)",
                    marginBottom: "10px",
                  }}
                >
                  <Clock size={14} />
                  Grace Mode Service Delivery:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {features.map((f) => {
                    const isGraceAllowed = graceAllowed.includes(f);
                    return (
                      <div
                        key={f}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          fontSize: "0.8125rem",
                        }}
                      >
                        <span style={{ color: isGraceAllowed ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                          {f}
                        </span>
                        {isGraceAllowed ? (
                          <span
                            className="badge badge-success"
                            style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                          >
                            Allowed
                          </span>
                        ) : (
                          <span
                            className="badge badge-danger"
                            style={{ fontSize: "0.6875rem", padding: "1px 6px" }}
                          >
                            Disabled
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Plan Modal */}
      {showAddModal && (
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
              width: "520px",
              padding: "24px",
              position: "relative",
              background: "var(--color-bg)",
              boxShadow: "var(--shadow-xl)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-ghost btn-icon btn-sm"
              style={{ position: "absolute", right: "16px", top: "16px" }}
            >
              <X size={16} />
            </button>
            <h3 style={{ marginBottom: "8px" }}>Create Utility Plan</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
              Define service features and configure smart-grace behavior.
            </p>

            <form onSubmit={handleCreatePlan} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                    Plan Name <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Solar Standard"
                    className="input"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                    Utility Type <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="solar">Solar Energy</option>
                    <option value="electricity">Estate Electricity</option>
                    <option value="water">Water Supply</option>
                    <option value="internet">Internet Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Monthly Cost (₦) <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  className="input"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Description
                </label>
                <textarea
                  placeholder="What is included in this utility plan..."
                  className="input"
                  style={{ minHeight: "60px", fontFamily: "inherit" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Dynamic Feature Builder */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Service Features & Devices <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    placeholder="Add device (e.g. Refrigerator, TV)"
                    className="input"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddFeature}>
                    Add
                  </button>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", background: "var(--color-bg-secondary)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                  {featureInputs.length > 0 ? (
                    featureInputs.map((f) => (
                      <span
                        key={f}
                        className="badge badge-neutral"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px" }}
                      >
                        {f}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(f)}
                          style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", padding: 0 }}
                        >
                          <X size={10} weight="bold" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                      No features configured yet. Add at least one feature.
                    </span>
                  )}
                </div>
              </div>

              {/* Grace Policy Configuration */}
              {featureInputs.length > 0 && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                    Grace Mode Allowance
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "10px" }}>
                    Check which features stay enabled during payment failures (Grace Mode). Unchecked features are turned off.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {featureInputs.map((f) => {
                      const isAllowed = graceAllowedFeatures.includes(f);
                      return (
                        <label
                          key={f}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "0.8125rem",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => handleToggleGraceFeature(f)}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          />
                          <span>{f}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
