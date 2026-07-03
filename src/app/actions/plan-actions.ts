"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authGuard } from "@/lib/auth-guard";
import { CreatePlanSchema, UpdatePlanSchema, IdSchema } from "@/lib/validators";

export async function getPlans() {
  try {
    return await db.utilityPlan.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}

export async function getPlan(id: string) {
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return null;

  try {
    return await db.utilityPlan.findUnique({
      where: { id: parsed.data },
    });
  } catch (error) {
    console.error(`Failed to fetch plan ${id}:`, error);
    return null;
  }
}

export async function createPlan(formData: {
  name: string;
  description?: string;
  type: string;
  amount: number;
  features: string[];
  graceAllowedFeatures: string[];
}) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const parsed = CreatePlanSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const plan = await db.utilityPlan.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        type: parsed.data.type,
        amount: parsed.data.amount,
        features: JSON.stringify(parsed.data.features),
        gracePolicy: JSON.stringify({
          allowed: parsed.data.graceAllowedFeatures,
          disabled: parsed.data.features.filter((f) => !parsed.data.graceAllowedFeatures.includes(f)),
        }),
        isActive: true,
      },
    });

    revalidatePath("/dashboard/plans");
    return { success: true, plan };
  } catch (error: any) {
    console.error("Failed to create plan:", error);
    return { success: false, error: error.message || "Failed to create plan" };
  }
}

export async function updatePlan(
  id: string,
  formData: {
    name?: string;
    description?: string;
    type?: string;
    amount?: number;
    features?: string[];
    graceAllowedFeatures?: string[];
  }
) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const idParsed = IdSchema.safeParse(id);
  if (!idParsed.success) return { success: false, error: "Invalid plan ID" };

  const parsed = UpdatePlanSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const existing = await db.utilityPlan.findUnique({ where: { id: idParsed.data } });
    if (!existing) {
      return { success: false, error: "Plan not found" };
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.type !== undefined) data.type = parsed.data.type;
    if (parsed.data.amount !== undefined) data.amount = parsed.data.amount;
    
    if (parsed.data.features !== undefined) {
      data.features = JSON.stringify(parsed.data.features);
      // Recalculate grace policy if features changed
      let allowed: string[];
      try {
        allowed = parsed.data.graceAllowedFeatures || JSON.parse(existing.gracePolicy).allowed;
      } catch {
        allowed = parsed.data.graceAllowedFeatures || [];
      }
      data.gracePolicy = JSON.stringify({
        allowed,
        disabled: parsed.data.features.filter((f) => !allowed.includes(f)),
      });
    } else if (parsed.data.graceAllowedFeatures !== undefined) {
      let features: string[];
      try {
        features = JSON.parse(existing.features);
      } catch {
        features = [];
      }
      data.gracePolicy = JSON.stringify({
        allowed: parsed.data.graceAllowedFeatures,
        disabled: features.filter((f: string) => !parsed.data.graceAllowedFeatures?.includes(f)),
      });
    }

    const plan = await db.utilityPlan.update({
      where: { id: idParsed.data },
      data,
    });

    revalidatePath("/dashboard/plans");
    return { success: true, plan };
  } catch (error: any) {
    console.error(`Failed to update plan ${id}:`, error);
    return { success: false, error: error.message || "Failed to update plan" };
  }
}

export async function togglePlanActive(id: string, isActive: boolean) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const idParsed = IdSchema.safeParse(id);
  if (!idParsed.success) return { success: false, error: "Invalid plan ID" };

  try {
    await db.utilityPlan.update({
      where: { id: idParsed.data },
      data: { isActive },
    });
    revalidatePath("/dashboard/plans");
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to toggle plan active ${id}:`, error);
    return { success: false, error: error.message };
  }
}
