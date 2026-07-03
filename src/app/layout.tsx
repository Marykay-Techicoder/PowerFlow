import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PowerFlow — Subscription Billing Infrastructure",
  description:
    "Recurring billing automation for utility providers. Grace Mode, Smart Retry Engine, and Payment Health Scoring powered by Nomba.",
  keywords: [
    "PowerFlow",
    "recurring billing",
    "subscription management",
    "utility billing",
    "Nomba",
    "solar billing",
    "grace mode",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "0.8125rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-md)",
            },
          }}
        />
      </body>
    </html>
  );
}
