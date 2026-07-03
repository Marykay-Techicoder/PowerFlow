"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { authGuard } from "@/lib/auth-guard";
import { CreateCustomerSchema, UpdateCustomerSchema, IdSchema } from "@/lib/validators";

export async function getCustomers() {
  try {
    return await db.customer.findMany({
      orderBy: { name: "asc" },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function getCustomer(id: string) {
  const parsed = IdSchema.safeParse(id);
  if (!parsed.success) return null;

  try {
    return await db.customer.findUnique({
      where: { id: parsed.data },
      include: {
        subscriptions: {
          include: {
            plan: true,
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          orderBy: { sentAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error(`Failed to fetch customer ${id}:`, error);
    return null;
  }
}

export async function createCustomer(formData: {
  name: string;
  email: string;
  phone: string;
  address?: string;
}) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const parsed = CreateCustomerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const customer = await db.customer.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        healthScore: 100,
        healthGrade: "excellent",
      },
    });

    revalidatePath("/dashboard/customers");
    return { success: true, customer };
  } catch (error: any) {
    console.error("Failed to create customer:", error);
    if (error.code === "P2002") {
      return { success: false, error: "A customer with this email already exists" };
    }
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function updateCustomer(
  id: string,
  formData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const idParsed = IdSchema.safeParse(id);
  if (!idParsed.success) return { success: false, error: "Invalid customer ID" };

  const parsed = UpdateCustomerSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  try {
    const customer = await db.customer.update({
      where: { id: idParsed.data },
      data: parsed.data,
    });

    revalidatePath(`/dashboard/customers/${id}`);
    revalidatePath("/dashboard/customers");
    return { success: true, customer };
  } catch (error: any) {
    console.error(`Failed to update customer ${id}:`, error);
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  const guard = await authGuard();
  if (!guard.authorized) return { success: false, error: guard.error };

  const idParsed = IdSchema.safeParse(id);
  if (!idParsed.success) return { success: false, error: "Invalid customer ID" };

  try {
    await db.customer.delete({
      where: { id: idParsed.data },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to delete customer ${id}:`, error);
    return { success: false, error: error.message || "Failed to delete customer" };
  }
}
