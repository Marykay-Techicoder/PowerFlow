"use client";

import { Receipt } from "@phosphor-icons/react";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  status: string;
  orderReference: string;
  nombaTransRef: string | null;
  failureReason: string | null;
  createdAt: Date;
}

interface InvoicesClientProps {
  payments: Payment[];
}

export function InvoicesClient({ payments }: InvoicesClientProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <span className="badge badge-success">Paid</span>;
      case "failed":
        return <span className="badge badge-danger">Failed</span>;
      default:
        return <span className="badge badge-neutral">Pending</span>;
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "28px" }}>
        <h1 className="page-title">My Invoices</h1>
        <p className="page-description">Billing history and transaction receipts</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {payments.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Billing Date</th>
                <th>Receipt Number</th>
                <th>Amount Billed</th>
                <th>Payment Status</th>
                <th>Transaction Details</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{format(new Date(p.createdAt), "MMM d, yyyy h:mm a")}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{p.orderReference}</td>
                  <td style={{ fontWeight: 600 }}>₦{p.amount.toLocaleString()}</td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                    {p.status === "success" && p.nombaTransRef && (
                      <span>Nomba ID: {p.nombaTransRef}</span>
                    )}
                    {p.status === "failed" && p.failureReason && (
                      <span style={{ color: "var(--color-danger)" }}>
                        Declined: {p.failureReason.replace("_", " ")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <Receipt size={40} className="empty-state-icon" />
            <p className="empty-state-title">No invoices available</p>
            <p className="empty-state-description">Your invoice history will appear once your subscription renews.</p>
          </div>
        )}
      </div>
    </div>
  );
}
