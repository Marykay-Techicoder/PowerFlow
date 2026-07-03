"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lightning, EnvelopeSimple, Lock, Eye, EyeSlash } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      if (authError) {
        setError(authError.message || "Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-secondary)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--color-accent)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Lightning size={24} weight="fill" color="white" />
          </div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Sign in to your PowerFlow account
          </p>
        </div>

        {/* Login Form */}
        <div
          className="card"
          style={{ padding: "28px" }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--color-danger-light)",
                  color: "var(--color-danger)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8125rem",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  marginBottom: "6px",
                  color: "var(--color-text-primary)",
                }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <EnvelopeSimple
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-tertiary)",
                  }}
                />
                <input
                  id="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="admin@powerflow.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  marginBottom: "6px",
                  color: "var(--color-text-primary)",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-tertiary)",
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-tertiary)",
                    padding: "4px",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: "100%", padding: "10px", marginTop: "4px" }}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--color-accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Demo hint */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            padding: "12px",
            background: "var(--color-accent-light)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            color: "var(--color-accent-text)",
          }}
        >
          <strong>Demo:</strong> Go to{" "}
          <a href="/register" style={{ color: "var(--color-accent)" }}>
            /register
          </a>{" "}
          to create your account, then sign in here
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
