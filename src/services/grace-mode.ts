import { GRACE_PERIOD_DAYS, SERVICE_LEVELS } from "@/lib/constants";
import { FeaturesSchema, GracePolicySchema } from "@/lib/validators";
import type { HealthGrade, SubscriptionStatus, GracePolicy } from "@/types";

/**
 * Gets the number of grace period days allowed for a customer based on their health grade.
 */
export function getGracePeriodDays(grade: HealthGrade): number {
  return GRACE_PERIOD_DAYS[grade] || 1;
}

/**
 * Calculates the service level (0-100) based on the subscription status.
 */
export function getServiceLevel(status: SubscriptionStatus): number {
  switch (status) {
    case "active":
    case "restored":
      return SERVICE_LEVELS.active;
    case "grace":
    case "retry_scheduled":
      return SERVICE_LEVELS.grace;
    case "suspended":
      return SERVICE_LEVELS.suspended;
    default:
      return 100;
  }
}

/**
 * Filters the active features of a utility plan based on the subscription status.
 * If in grace mode, only features allowed in the grace policy are kept active.
 * If suspended, zero features are active.
 * 
 * Uses Zod schemas for runtime JSON validation instead of raw JSON.parse.
 */
export function getActiveFeatures(
  planFeaturesJson: string,
  gracePolicyJson: string,
  status: SubscriptionStatus
): { enabled: string[]; disabled: string[] } {
  // Parse and validate features with Zod
  const featuresResult = FeaturesSchema.safeParse(safeJsonParse(planFeaturesJson));
  const features = featuresResult.success ? featuresResult.data : [];

  if (!featuresResult.success) {
    console.error("Failed to parse plan features JSON:", featuresResult.error.message);
  }

  // Parse and validate grace policy with Zod
  const policyResult = GracePolicySchema.safeParse(safeJsonParse(gracePolicyJson));
  const gracePolicy: GracePolicy = policyResult.success
    ? policyResult.data
    : { allowed: [], disabled: [] };

  if (!policyResult.success) {
    console.error("Failed to parse grace policy JSON:", policyResult.error.message);
  }

  if (status === "active" || status === "restored") {
    return {
      enabled: features,
      disabled: [],
    };
  }

  if (status === "suspended") {
    return {
      enabled: [],
      disabled: features,
    };
  }

  if (status === "grace" || status === "retry_scheduled") {
    const enabled = features.filter((f) => gracePolicy.allowed.includes(f));
    const disabled = features.filter((f) => !gracePolicy.allowed.includes(f));
    return { enabled, disabled };
  }

  return {
    enabled: features,
    disabled: [],
  };
}

/** Safe JSON.parse that returns undefined on failure instead of throwing */
function safeJsonParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}
