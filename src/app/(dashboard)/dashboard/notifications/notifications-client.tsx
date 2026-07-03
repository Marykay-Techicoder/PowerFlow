"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  WhatsappLogo,
  EnvelopeSimple,
  ChatCircleText,
  Funnel,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface NotificationLog {
  id: string;
  channel: string; // whatsapp | email | sms
  type: string;
  title: string;
  message: string;
  sentAt: Date;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

interface NotificationsClientProps {
  initialNotifications: NotificationLog[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications] = useState<NotificationLog[]>(initialNotifications);
  const [channelFilter, setChannelFilter] = useState("all");

  const filteredLogs = notifications.filter((log) => {
    return channelFilter === "all" || log.channel === channelFilter;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <WhatsappLogo size={18} weight="fill" color="#25D366" />;
      case "email":
        return <EnvelopeSimple size={18} color="var(--color-accent)" />;
      default:
        return <ChatCircleText size={18} color="var(--color-text-secondary)" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <span className="badge" style={{ background: "#E8F8EF", color: "#25D366" }}>WhatsApp</span>;
      case "email":
        return <span className="badge badge-info">Email</span>;
      default:
        return <span className="badge badge-neutral">SMS</span>;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Notification Logs</h1>
        <p className="page-description">Verify outgoing SMS, WhatsApp messages, and Email alerts delivered to customers</p>
      </div>

      {/* Controls Card */}
      <div className="card" style={{ padding: "16px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Funnel size={16} color="var(--color-text-secondary)" />
          <select
            className="input"
            style={{ width: "200px", padding: "6px 12px" }}
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            <option value="whatsapp">WhatsApp Business API</option>
            <option value="sms">SMS Alerts</option>
            <option value="email">Transactional Email</option>
          </select>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)", marginLeft: "auto" }}>
          Showing {filteredLogs.length} simulated dispatches
        </div>
      </div>

      {/* Logs Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              className="card"
              key={log.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {/* Log Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--color-border)",
                  paddingBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {getChannelIcon(log.channel)}
                  {getChannelBadge(log.channel)}
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>•</span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                    Recipient:{" "}
                    <Link
                      href={`/dashboard/customers/${log.customer.id}`}
                      style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none" }}
                    >
                      {log.customer.name}
                    </Link>{" "}
                    (
                    {log.channel === "email"
                      ? log.customer.email
                      : log.channel === "whatsapp"
                      ? log.customer.phone
                      : log.customer.phone}
                    )
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
                  {format(new Date(log.sentAt), "MMM d, yyyy h:mm a")}
                </div>
              </div>

              {/* Log Message */}
              <div>
                <h4 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "4px" }}>{log.title}</h4>
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.5,
                    background: "var(--color-bg-secondary)",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    fontFamily: log.channel === "email" ? "inherit" : "monospace",
                  }}
                >
                  {log.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ padding: "48px 24px" }}>
            <div className="empty-state">
              <Bell size={48} className="empty-state-icon" />
              <p className="empty-state-title">No notifications logged</p>
              <p className="empty-state-description">Try adjusting your channel filter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
