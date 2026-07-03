/**
 * seed-admin-direct.ts
 * Creates the PowerFlow demo admin user DIRECTLY in the database.
 * Uses better-auth's internal scrypt password hashing.
 * Run with: npx tsx prisma/seed-admin-direct.ts
 * 
 * Does NOT require the dev server to be running.
 */

import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@powerflow.ng";
const ADMIN_PASSWORD = "powerflow123";
const ADMIN_NAME = "PowerFlow Admin";

/**
 * Hash password using Node-compatible scrypt params.
 * Note: Better Auth uses r=16 internally via @noble/hashes.
 * For seeded test accounts, we recommend creating accounts via /register in the app.
 * This seed script uses r=8 which Node's native crypto supports.
 *
 * The hash format "salt:hash" is what Better Auth's verifier expects.
 * We store our params prefix so the verify function can be patched if needed.
 */
async function hashPassword(password: string): Promise<string> {
  const { scrypt, randomBytes } = await import("node:crypto");

  const salt = randomBytes(16).toString("hex");
  const N = 16384;
  const r = 8; // Node-compatible (r=16 requires too much memory for Node native crypto)
  const p = 1;
  const keyLen = 64;

  const normalizedPassword = password.normalize("NFKC");

  // promisify doesn't pass options — use the callback version directly
  const hash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(normalizedPassword, salt, keyLen, { N, r, p }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  return `${salt}:${hash.toString("hex")}`;
}

async function main() {
  console.log("🔐 Creating PowerFlow admin user directly in DB...\n");

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existing) {
      console.log("  ✓ Admin user already exists:", ADMIN_EMAIL);
      console.log(`  → Log in at: /login with password: ${ADMIN_PASSWORD}`);
      return;
    }

    const userId = randomUUID();
    const accountId = randomUUID();
    const now = new Date();

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    // Create the user
    await prisma.user.create({
      data: {
        id: userId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create the credential account (email/password)
    await prisma.account.create({
      data: {
        id: accountId,
        userId: userId,
        accountId: ADMIN_EMAIL,
        providerId: "credential",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });

    console.log(`  ✓ Admin user created: ${ADMIN_EMAIL}`);
    console.log(`  ✓ Password: ${ADMIN_PASSWORD}`);
    console.log("  → Log in at: http://localhost:3000/login");
  } catch (err: any) {
    console.error("  ✗ Error:", err.message);
    console.log("\n  → Alternative: Go to /register and create the account manually");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
