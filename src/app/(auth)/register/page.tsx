"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightning, EnvelopeSimple, Lock, User, Eye, EyeSlash } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      if (authError) {
        setError(authError.message || "Failed to create account. Please try again.");
        setIsLoading(false);
        return;
      }

      if (data) {
        router.push("/dashboard");
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
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
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
            Create your account
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginTop: "4px" }}>
            Start managing subscriptions with PowerFlow
          </p>
        </div>

        {/* Register Form */}
        <div className="card" style={{ padding: "28px" }}>
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
              <label htmlFor="name" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "6px" }}>
                Full name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "6px" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <EnvelopeSimple size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-tertiary)", padding: "4px", display: "flex" }}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, marginBottom: "6px" }}>
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)" }} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="input"
                  style={{ paddingLeft: "36px" }}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: "100%", padding: "10px", marginTop: "4px" }}
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-tertiary)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
