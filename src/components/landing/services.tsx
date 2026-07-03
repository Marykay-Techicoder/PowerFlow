"use client";

import { motion } from "framer-motion";
import { Plug, ArrowsClockwise, HardDrives, ChartBar, Drop, WifiHigh, Lightning } from "@phosphor-icons/react";

const features = [
  {
    name: "Smart Grace Mode",
    description: "When payment fails, heavy appliances (AC, heater) are disabled, but essential services (lights, phone charging) continue running.",
    icon: Plug,
    color: "var(--color-warning)",
    bg: "var(--color-warning-light)"
  },
  {
    name: "Automated Retries",
    description: "The retry engine automatically attempts recovery to capture temporary network fixes or late deposits, without manual intervention.",
    icon: ArrowsClockwise,
    color: "var(--color-accent)",
    bg: "var(--color-accent-light)"
  },
  {
    name: "IoT Hardware Control",
    description: "Direct integration with smart meters and hardware controllers to enforce policies instantly across your entire network.",
    icon: HardDrives,
    color: "var(--color-success)",
    bg: "var(--color-success-light)"
  },
  {
    name: "Real-time Analytics",
    description: "Track payment health, recovery rates, and system-wide grace mode status from a comprehensive dashboard.",
    icon: ChartBar,
    color: "var(--color-info)",
    bg: "var(--color-info-light)"
  },
  {
    name: "Multi-Utility Support",
    description: "Whether you provide Solar, Estate Electricity, Water, or Internet, PowerFlow handles the billing and control.",
    icon: Drop,
    color: "var(--color-primary)",
    bg: "bg-blue-100"
  },
  {
    name: "Instant Activation",
    description: "As soon as a successful payment is detected via webhooks, full service is restored automatically.",
    icon: Lightning,
    color: "var(--color-success)",
    bg: "var(--color-success-light)"
  },
];

export function Services() {
  return (
    <section id="services" className="bg-white py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-[var(--color-accent)]"
          >
            The Solution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            How PowerFlow Works
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            A complete system that integrates billing logic with physical hardware control to optimize revenue recovery and customer satisfaction.
          </motion.p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl`} style={{ backgroundColor: feature.bg }}>
                    <feature.icon size={24} style={{ color: feature.color }} weight="fill" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
