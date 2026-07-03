"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lightning, ShieldCheck, CurrencyCircleDollar, Plug, CheckCircle, WifiHigh } from "@phosphor-icons/react";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-white pt-32 pb-32 lg:pt-40 lg:pb-40 scroll-mt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-[var(--color-accent)] opacity-10 blur-3xl mix-blend-multiply"></div>
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[var(--color-success)] opacity-10 blur-3xl mix-blend-multiply"></div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        ></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-light)] px-4 py-2 text-sm font-semibold text-[var(--color-accent)]">
              <Lightning size={16} weight="fill" />
              <span>Smart Billing Recovery Platform</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl"
          >
            Stop Cutting Off Customers. <br className="hidden sm:block" />
            <span className="text-[var(--color-accent)]">Start Recovering Revenue.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600"
          >
            PowerFlow integrates hardware control with smart billing logic. When payments fail, we don&apos;t disconnect. Grace Mode keeps essential power running while our automated engine recovers the funds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-accent-hover)] transition-all hover:scale-105"
            >
              Get Started Now <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-[var(--color-accent)] transition-colors"
            >
              Sign in to Dashboard <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </div>

        {/* Product visual: live meter dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative mx-auto mt-20 max-w-3xl"
        >
          {/* Floating badge: payment recovered */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ opacity: { duration: 0.5, delay: 0.9 }, x: { duration: 0.5, delay: 0.9 }, y: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
            className="absolute -left-4 top-8 z-20 hidden sm:flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-gray-200 lg:-left-10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-success-light)] text-[var(--color-success)]">
              <CurrencyCircleDollar size={20} weight="fill" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Payment recovered</p>
              <p className="text-sm font-semibold text-gray-900">+ ₦12,400</p>
            </div>
          </motion.div>

          {/* Floating badge: grace mode active */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
            transition={{ opacity: { duration: 0.5, delay: 1.1 }, x: { duration: 0.5, delay: 1.1 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.4 } }}
            className="absolute -right-4 bottom-10 z-20 hidden sm:flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-gray-200 lg:-right-10"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <Plug size={20} weight="fill" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Meter #A204</p>
              <p className="text-sm font-semibold text-gray-900">Grace Mode Active</p>
            </div>
          </motion.div>

          {/* Dashboard card */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span className="h-3 w-3 rounded-full bg-green-400"></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <WifiHigh size={16} className="text-[var(--color-success)]" />
                Live sync
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">Network recovery rate</p>
                  <span className="text-sm font-semibold text-[var(--color-success)]">82%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "82%" }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-[var(--color-success)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Active meters</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">4,812</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">In Grace Mode</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">126</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl bg-gray-900 p-5 text-white">
                <div>
                  <p className="text-xs text-gray-400">System status</p>
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle size={18} weight="fill" className="text-[var(--color-success)]" />
                    <span className="text-sm font-semibold">All webhooks healthy</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                  <ShieldCheck size={16} />
                  Auto-retry enabled
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
