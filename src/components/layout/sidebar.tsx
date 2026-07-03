"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  ArrowsClockwise,
  Package,
  Receipt,
  Lightning,
  Plugs,
  Bell,
  GearSix,
  SignOut,
  CaretDoubleLeft,
  CaretDoubleRight,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone"; className?: string }>> = {
  SquaresFour,
  Users,
  Repeat: ArrowsClockwise,
  Package,
  Receipt,
  Lightning,
  Plugs,
  Bell,
  GearSix,
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
  section: string;
}

const NAVIGATION: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "SquaresFour", section: "main" },
  { label: "Customers", href: "/dashboard/customers", icon: "Users", section: "main" },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: "Repeat", section: "main" },
  { label: "Utility Plans", href: "/dashboard/plans", icon: "Package", section: "main" },
  { label: "Billing", href: "/dashboard/billing", icon: "Receipt", section: "billing" },
  { label: "Simulator", href: "/dashboard/simulator", icon: "Lightning", section: "billing" },
  { label: "Webhooks", href: "/dashboard/webhooks", icon: "Plugs", section: "system" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "Bell", section: "system" },
];

const SECTIONS: Record<string, string> = {
  main: "Platform",
  billing: "Billing Engine",
  system: "System",
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, setCommandMenuOpen } = useAppStore();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  const groupedNav = NAVIGATION.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className={cn("sidebar", !sidebarOpen && "collapsed")}>
      {/* Logo */}
      <div
        style={{
          padding: "16px 16px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {sidebarOpen && (
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "var(--color-text-primary)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "var(--color-accent)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lightning size={16} weight="fill" color="white" />
            </div>
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", letterSpacing: "-0.02em" }}>
              PowerFlow
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="btn-ghost btn-icon btn-sm"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{ flexShrink: 0 }}
        >
          {sidebarOpen ? <CaretDoubleLeft size={16} /> : <CaretDoubleRight size={16} />}
        </button>
      </div>

      {/* Search trigger */}
      {sidebarOpen && (
        <div style={{ padding: "8px 12px" }}>
          <button
            onClick={() => setCommandMenuOpen(true)}
            className="btn btn-secondary"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              gap: "8px",
              color: "var(--color-text-tertiary)",
              fontSize: "0.8125rem",
              padding: "6px 10px",
            }}
          >
            <MagnifyingGlass size={16} />
            <span style={{ flex: 1, textAlign: "left" }}>Search…</span>
            <kbd
              style={{
                fontSize: "0.6875rem",
                padding: "1px 4px",
                borderRadius: "4px",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text-tertiary)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "8px 12px", overflow: "auto" }}>
        {Object.entries(groupedNav).map(([section, items]) => (
          <div key={section} style={{ marginBottom: "20px" }}>
            {sidebarOpen && (
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "0 12px 6px",
                }}
              >
                {SECTIONS[section]}
              </div>
            )}
            {items.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("nav-item", isActive && "active")}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {Icon && <Icon size={18} weight={isActive ? "fill" : "regular"} className="nav-icon" />}
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {sidebarOpen && (
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          <Link href="/dashboard/settings" className="nav-item">
            <GearSix size={18} className="nav-icon" />
            <span>Settings</span>
          </Link>
          <button
            className="nav-item"
            onClick={handleSignOut}
            style={{ border: "none", background: "none", width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer" }}
          >
            <SignOut size={18} className="nav-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
