"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lightning, List, X } from "@phosphor-icons/react";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm ring-1 ring-gray-900/5"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
            <Lightning size={18} weight="fill" />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">
            PowerFlow
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-x-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-semibold leading-6 text-gray-700 transition-colors hover:text-[var(--color-accent)]"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-x-6 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold leading-6 text-gray-700 transition-colors hover:text-[var(--color-accent)]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--color-accent-hover)] hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-900 lg:hidden"
          aria-label="Open menu"
        >
          <List size={24} />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xs overflow-y-auto bg-white px-6 py-6 shadow-xl lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Link href="#home" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
                    <Lightning size={16} weight="fill" />
                  </div>
                  <span className="text-base font-bold text-gray-900">PowerFlow</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-y-3 border-t border-gray-100 pt-6">
                <Link
                  href="/login"
                  className="rounded-md px-4 py-2.5 text-center text-sm font-semibold text-gray-900 ring-1 ring-gray-200 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-accent-hover)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
