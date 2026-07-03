"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightning, SignOut } from "@phosphor-icons/react";
import { Toaster } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function CustomerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleExit = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg-secondary)", display: "flex", flexDirection: "column" }}>
      {/* Customer Header */}
      <header
        style={{
          height: "64px",
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <Link
          href="/customer"
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
            PowerFlow Customer Portal
          </span>
        </Link>

        <nav style={{ display: "flex", gap: "20px" }}>
          <Link
            href="/customer"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              color: "var(--color-text-secondary)",
            }}
          >
            My Subscription
          </Link>
          <Link
            href="/customer/invoices"
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
              color: "var(--color-text-secondary)",
            }}
          >
            Invoices
          </Link>
        </nav>

        <button
          onClick={handleExit}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: "6px 10px",
            borderRadius: "var(--radius-md)",
          }}
          className="btn-ghost"
        >
          <SignOut size={16} />
          Exit Portal
        </button>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: "40px 24px" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>{children}</div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
