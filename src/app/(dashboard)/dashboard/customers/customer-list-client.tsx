"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  MagnifyingGlass,
  Funnel,
  ArrowRight,
  DotsThreeVertical,
  X,
} from "@phosphor-icons/react";
import { createCustomer } from "@/app/actions/customer-actions";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string | null;
  healthScore: number;
  healthGrade: string;
  subscriptions?: {
    status: string;
    plan: {
      name: string;
    };
  }[];
}

interface CustomerListClientProps {
  initialCustomers: Customer[];
}

export function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCustomer({ name, email, phone, address });
      if (res.success && res.customer) {
        toast.success("Customer added successfully");
        setCustomers((prev) => [...prev, res.customer as any]);
        setShowAddModal(false);
        // Clear form
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
      } else {
        toast.error(res.error || "Failed to create customer");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search);

    const subStatus = customer.subscriptions?.[0]?.status || "none";
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subStatus === "active") ||
      (statusFilter === "grace" && subStatus === "grace") ||
      (statusFilter === "suspended" && subStatus === "suspended") ||
      (statusFilter === "none" && subStatus === "none");

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
        return <span className="badge badge-neutral">No Subscription</span>;
    }
  };

  const getHealthBadge = (score: number, grade: string) => {
    let color = "badge-success";
    if (grade === "critical") color = "badge-danger";
    else if (grade === "at_risk") color = "badge-warning";
    else if (grade === "good") color = "badge-info";

    return (
      <span className={`badge ${color}`}>
        {score}% ({grade.toUpperCase()})
      </span>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-description">Manage customer subscriptions and track billing health</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} weight="bold" />
          Add Customer
        </button>
      </div>

      {/* Controls Card */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <MagnifyingGlass size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone…"
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
            style={{ width: "160px", padding: "6px 12px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="grace">Grace Mode</option>
            <option value="suspended">Suspended</option>
            <option value="none">No Subscription</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filteredCustomers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Subscription Plan</th>
                <th>Status</th>
                <th>Payment Health</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const sub = customer.subscriptions?.[0];
                return (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{customer.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>ID: {customer.id}</div>
                    </td>
                    <td>
                      <div>{customer.email}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{customer.phone}</div>
                    </td>
                    <td>
                      {sub ? (
                        <div style={{ fontWeight: 500 }}>{sub.plan.name}</div>
                      ) : (
                        <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                      )}
                    </td>
                    <td>{getStatusBadge(sub?.status || "none")}</td>
                    <td>{getHealthBadge(customer.healthScore, customer.healthGrade)}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        Details
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <Users size={48} className="empty-state-icon" />
            <p className="empty-state-title">No customers found</p>
            <p className="empty-state-description">Try adjusting your filters or add a new customer to get started.</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
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
              width: "480px",
              padding: "24px",
              position: "relative",
              background: "var(--color-bg)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="btn-ghost btn-icon btn-sm"
              style={{ position: "absolute", right: "16px", top: "16px" }}
            >
              <X size={16} />
            </button>
            <h3 style={{ marginBottom: "8px" }}>Add New Customer</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "20px" }}>
              Register a customer to setup subscriptions and billing.
            </p>

            <form onSubmit={handleAddCustomer} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Full Name <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chioma Okafor"
                  className="input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Email Address <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. chioma@gmail.com"
                  className="input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Phone Number <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +234 810 234 5678"
                  className="input"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, marginBottom: "6px" }}>
                  Billing Address
                </label>
                <textarea
                  placeholder="Street, City, State"
                  className="input"
                  style={{ minHeight: "80px", fontFamily: "inherit" }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
