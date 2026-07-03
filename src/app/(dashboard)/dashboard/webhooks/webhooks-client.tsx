"use client";

import { useState } from "react";
import {
  Plugs,
  Code,
  CheckCircle,
  XCircle,
  CaretDown,
  CaretUp,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface WebhookEvent {
  id: string;
  source: string;
  eventType: string;
  payload: string; // JSON string
  processed: boolean;
  createdAt: Date;
}

interface WebhooksClientProps {
  initialEvents: WebhookEvent[];
}

export function WebhooksClient({ initialEvents }: WebhooksClientProps) {
  const [events] = useState<WebhookEvent[]>(initialEvents);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEventId((prev) => (prev === id ? null : id));
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "payment_success":
        return <span className="badge badge-success">payment_success</span>;
      case "payment_failed":
        return <span className="badge badge-danger">payment_failed</span>;
      case "token_created":
        return <span className="badge badge-info">token_created</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  const formatJson = (jsonStr: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">Webhook Events</h1>
        <p className="page-description">Verify incoming payload webhooks dispatched by Nomba checkout gates</p>
      </div>

      {/* Webhook Endpoint Info */}
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          background: "var(--color-bg-secondary)",
          padding: "16px 20px",
        }}
      >
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
            WEBHOOK ENDPOINT URL (SANDBOX)
          </div>
          <div style={{ fontSize: "0.9375rem", fontWeight: 600, fontFamily: "monospace", marginTop: "4px" }}>
            https://powerflow.vercel.app/api/webhooks/nomba
          </div>
        </div>
        <span className="badge badge-success" style={{ padding: "4px 10px" }}>
          Active & Listening
        </span>
      </div>

      {/* Events List */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {events.length > 0 ? (
          <div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}></th>
                  <th>Received At</th>
                  <th>Event Source</th>
                  <th>Event Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Payload</th>
                </tr>
              </thead>
              <tbody>
                {events.flatMap((event) => {
                  const isExpanded = expandedEventId === event.id;
                  return [
                    <tr
                      key={event.id}
                      onClick={() => toggleExpand(event.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                      </td>
                      <td>{format(new Date(event.createdAt), "MMM d, yyyy h:mm: a")}</td>
                      <td style={{ textTransform: "capitalize", fontWeight: 500 }}>{event.source}</td>
                      <td>{getEventBadge(event.eventType)}</td>
                      <td>
                        {event.processed ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-success)" }}>
                            <CheckCircle size={14} weight="fill" />
                            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Processed</span>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-danger)" }}>
                            <XCircle size={14} weight="fill" />
                            <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Failed</span>
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-secondary btn-sm" style={{ padding: "2px 8px" }}>
                          <Code size={12} />
                          JSON
                        </button>
                      </td>
                    </tr>,
                    isExpanded && (
                      <tr key={`${event.id}-expanded`} style={{ background: "var(--color-bg-secondary)" }}>
                        <td colSpan={6} style={{ padding: "16px 24px" }}>
                          <pre
                            style={{
                              margin: 0,
                              padding: "16px",
                              background: "var(--color-bg)",
                              border: "1px solid var(--color-border)",
                              borderRadius: "var(--radius-md)",
                              overflowX: "auto",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              lineHeight: 1.5,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            <code>{formatJson(event.payload)}</code>
                          </pre>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <Plugs size={48} className="empty-state-icon" />
            <p className="empty-state-title">No webhook events logged</p>
            <p className="empty-state-description">Events will display as soon as the simulated checkout gate triggers webhook updates.</p>
          </div>
        )}
      </div>
    </div>
  );
}
