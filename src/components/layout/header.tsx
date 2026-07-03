"use client";

import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import { useAppStore } from "@/stores/app-store";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  "/dashboard": { title: "Overview", description: "Platform metrics and demo player" },
  "/dashboard/customers": { title: "Customers", description: "Manage your customer base" },
  "/dashboard/subscriptions": { title: "Subscriptions", description: "Subscription lifecycle management" },
  "/dashboard/plans": { title: "Utility Plans", description: "Configure service plans and grace policies" },
  "/dashboard/billing": { title: "Billing", description: "Billing cycles, retries, and payment health" },
  "/dashboard/simulator": { title: "IoT Simulator", description: "Visualize service levels and grace mode" },
  "/dashboard/webhooks": { title: "Webhooks", description: "Nomba webhook event stream" },
  "/dashboard/notifications": { title: "Notifications", description: "Customer communication timeline" },
};

export function Header() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name || "Admin";
  const userInitials = getInitials(userName);

  // Find matching page title (handle dynamic routes)
  const pageInfo = PAGE_TITLES[pathname] || {
    title: pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard",
  };

  // Build breadcrumbs
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="header">
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ marginRight: "12px" }}
          aria-label="Open sidebar"
        >
          <List size={18} />
        </button>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

          return (
            <span key={segment} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {index > 0 && (
                <span style={{ color: "var(--color-text-tertiary)", fontSize: "0.75rem" }}>/</span>
              )}
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: isLast ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                  fontWeight: isLast ? 500 : 400,
                }}
              >
                {label}
              </span>
            </span>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right side — user session + mode badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.75rem",
            fontWeight: 500,
            background: "var(--color-success-light)",
            color: "var(--color-success)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--color-success)",
            }}
          />
          Mock Mode
        </div>

        {/* User avatar showing real initials */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
          title={userName}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
