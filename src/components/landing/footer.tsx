"use client";

import Link from "next/link";
import { Lightning } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center md:order-2 space-x-6 md:space-x-8">
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Login
          </Link>
          <Link href="/register" className="text-sm font-medium text-gray-500 hover:text-[var(--color-accent)] transition-colors">
            Register
          </Link>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Terms
          </a>
          <a href="#" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Privacy
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0 flex items-center justify-center md:justify-start gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
            <Lightning size={16} weight="fill" />
          </div>
          <p className="text-center text-sm leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} PowerFlow, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
