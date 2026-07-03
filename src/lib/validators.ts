import { z } from "zod";

// ─── Customer Schemas ───────────────────────────────────────

export const CreateCustomerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone too long"),
  address: z.string().max(200, "Address too long").optional(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).max(15).optional(),
  address: z.string().max(200).optional(),
});

// ─── Plan Schemas ───────────────────────────────────────────

export const CreatePlanSchema = z.object({
  name: z.string().min(2, "Plan name required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["solar", "water", "internet", "electricity"]),
  amount: z.number().positive("Amount must be positive").max(10_000_000, "Amount too large"),
  features: z.array(z.string().min(1)).min(1, "At least one feature required"),
  graceAllowedFeatures: z.array(z.string()),
});

export const UpdatePlanSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(["solar", "water", "internet", "electricity"]).optional(),
  amount: z.number().positive().max(10_000_000).optional(),
  features: z.array(z.string().min(1)).optional(),
  graceAllowedFeatures: z.array(z.string()).optional(),
});

// ─── Subscription Schemas ───────────────────────────────────

export const CreateSubscriptionSchema = z.object({
  customerId: z.string().min(1, "Customer ID required"),
  planId: z.string().min(1, "Plan ID required"),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
});

export const SimulatePaymentSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID required"),
});

export const SimulateFailureSchema = z.object({
  subscriptionId: z.string().min(1, "Subscription ID required"),
  reason: z.enum(["insufficient_funds", "gateway_timeout", "bank_decline", "card_expired"]),
});

// ─── ID Schemas ─────────────────────────────────────────────

export const IdSchema = z.string().min(1, "ID is required");

// ─── Grace Policy Schema (for runtime JSON validation) ──────

export const GracePolicySchema = z.object({
  allowed: z.array(z.string()),
  disabled: z.array(z.string()),
});

export const FeaturesSchema = z.array(z.string());
