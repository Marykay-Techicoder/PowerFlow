import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Gets the current authenticated session.
 * Returns the session or null if not authenticated.
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch {
    return null;
  }
}

/**
 * Requires authentication. Returns session or throws.
 * Use in server actions that require auth.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Auth guard result for server actions.
 * Returns { authorized: false, error } or { authorized: true, session }.
 */
export async function authGuard(): Promise<
  | { authorized: true; session: NonNullable<Awaited<ReturnType<typeof getSession>>> }
  | { authorized: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { authorized: false, error: "Unauthorized — please log in" };
  }
  return { authorized: true, session };
}
