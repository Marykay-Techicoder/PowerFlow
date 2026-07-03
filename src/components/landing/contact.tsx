"use client";

import { motion } from "framer-motion";
import { EnvelopeSimple, Phone, MapPin } from "@phosphor-icons/react";

export function Contact() {
  return (
    <section id="contact" className="bg-gray-50 py-24 sm:py-32 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-accent)] blur-3xl mix-blend-multiply"></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl space-y-16 divide-y divide-gray-100 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold tracking-tight text-gray-900"
              >
                Get in touch
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-4 leading-7 text-gray-600"
              >
                Ready to transform your utility billing and stop customer churn? Contact our team to schedule a demo.
              </motion.p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-gray-200"
              >
                <h3 className="text-base font-semibold leading-7 text-gray-900 flex items-center gap-2">
                  <EnvelopeSimple size={20} className="text-[var(--color-accent)]" />
                  Email Support
                </h3>
                <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                  <div>
                    <dt className="sr-only">Email</dt>
                    <dd>
                      <a className="font-semibold text-[var(--color-accent)] hover:underline" href="mailto:hello@powerflow.ng">
                        hello@powerflow.ng
                      </a>
                    </dd>
                  </div>
                </dl>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-gray-200"
              >
                <h3 className="text-base font-semibold leading-7 text-gray-900 flex items-center gap-2">
                  <MapPin size={20} className="text-[var(--color-accent)]" />
                  Office Location
                </h3>
                <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                  <div className="mt-1">
                    <dt className="sr-only">Address</dt>
                    <dd>Lagos, Nigeria</dd>
                  </div>
                </dl>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
