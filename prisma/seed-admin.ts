/**
 * seed-admin.ts
 * Creates the PowerFlow demo admin user via Better Auth's API.
 * Run with: npx tsx prisma/seed-admin.ts
 *
 * This must be run AFTER `npx prisma db push` and AFTER the dev server is running,
 * since it calls the Better Auth /api/auth/sign-up/email endpoint directly.
 *
 * Alternatively, run it once manually via the register page on the app.
 */

import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Simple password hashing compatible with Better Auth's bcrypt-style scheme
// Better Auth uses scrypt for password hashing. We use their API endpoint instead.

async function main() {
  console.log("🔐 Seeding PowerFlow admin user...\n");

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const ADMIN_EMAIL = "admin@powerflow.ng";
  const ADMIN_PASSWORD = "powerflow123";
  const ADMIN_NAME = "PowerFlow Admin";

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log("  ✓ Admin user already exists:", ADMIN_EMAIL);
      console.log("  → You can log in at: /login");
      console.log(`  → Email: ${ADMIN_EMAIL}`);
      console.log(`  → Password: ${ADMIN_PASSWORD}`);
      return;
    }

    // Call the Better Auth sign-up endpoint to create the user
    // This ensures the password is correctly hashed using Better Auth's algorithm
    const response = await fetch(`${APP_URL}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      }),
    });

    if (response.ok) {
      console.log(`  ✓ Created admin user: ${ADMIN_EMAIL}`);
      console.log(`  ✓ Password: ${ADMIN_PASSWORD}`);
      console.log("  → Log in at: /login");
    } else {
      const errText = await response.text();
      console.error("  ✗ Failed to create admin user:", errText);
      console.log("\n  → Alternative: Register manually at /register");
      console.log(`  → Use email: ${ADMIN_EMAIL}, password: ${ADMIN_PASSWORD}`);
    }
  } catch (err: any) {
    if (err.code === "ECONNREFUSED") {
      console.log("  ⚠ Dev server not running. To create the admin user:");
      console.log("  1. Start the app:  npm run dev");
      console.log("  2. Go to:          http://localhost:3000/register");
      console.log(`  3. Register with:  ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    } else {
      console.error("  ✗ Error:", err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
