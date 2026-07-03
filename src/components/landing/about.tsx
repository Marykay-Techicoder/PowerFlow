"use client";

import { motion } from "framer-motion";
import { Plug, XCircle, BatteryWarning } from "@phosphor-icons/react";

export function About() {
  return (
    <section id="about" className="bg-gray-50 py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-[var(--color-accent)]"
          >
            The Problem
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            Traditional Pay-As-You-Go is Broken
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            When a customer&apos;s monthly payment fails due to insufficient funds, network decline, or bank timeouts, their power is instantly disconnected. This damages relationships and directly leads to customer churn.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col"
            >
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[var(--color-danger-light)]">
                  <XCircle size={20} className="text-[var(--color-danger)]" weight="fill" />
                </div>
                Network Declines
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">A payment failing because of a 5-second bank timeout shouldn&apos;t mean a family sits in the dark all night.</p>
              </dd>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col"
            >
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gray-200">
                  <BatteryWarning size={20} className="text-gray-600" weight="fill" />
                </div>
                Insufficient Funds
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Customers may be 24 hours away from getting paid. Cutting them off immediately destroys trust and goodwill.</p>
              </dd>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col"
            >
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[var(--color-warning-light)]">
                  <Plug size={20} className="text-[var(--color-warning)]" weight="fill" />
                </div>
                Permanent Churn
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">Frustrated customers switch providers. PowerFlow prevents this by keeping essential power on while waiting for payment.</p>
              </dd>
            </motion.div>
          </dl>
        </div>
      </div>
    </section>
  );
}
