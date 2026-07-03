import type { HealthGrade } from "@/types";

interface HealthMetrics {
  score: number;
  grade: HealthGrade;
}

/**
 * Calculates a customer's payment health score (0-100) and grade
 * based on their payment history and retry attempts.
 * 
 * Weights:
 * - Failed Payments (40%)
 * - Delayed/Late Payments (20%)
 * - Retry Count (25%)
 * - Payment Consistency (15%)
 */
export function calculateCustomerHealth(
  payments: { status: string; createdAt: Date }[],
  retries: { status: string }[]
): HealthMetrics {
  let score = 100;

  // 1. Failed Payments (Max deduction: 40 points)
  const failedPayments = payments.filter((p) => p.status === "failed").length;
  const totalPayments = payments.length;
  
  if (totalPayments > 0) {
    const failureRatio = failedPayments / totalPayments;
    score -= Math.min(40, failureRatio * 40 * 2.5); // Accelerated penalty for failures
  }

  // 2. Retry Count (Max deduction: 25 points)
  // Penalize for the number of times we had to retry payments
  const totalRetries = retries.length;
  score -= Math.min(25, totalRetries * 5); // 5 points off per retry attempt

  // 3. Delayed/Late Payments (Max deduction: 20 points)
  // A payment is considered "delayed" if it was successful but required a retry
  const successfulRetries = retries.filter((r) => r.status === "success").length;
  score -= Math.min(20, successfulRetries * 7); // 7 points off per delayed payment

  // 4. Payment Consistency (Max deduction/bonus: 15 points)
  // Look at the last 3 payments. If they were all successful on the first try, we reward consistency.
  if (totalPayments >= 3) {
    const lastThree = payments
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 3);
    
    const allSuccessful = lastThree.every((p) => p.status === "success");
    if (!allSuccessful) {
      score -= 15; // Penalty for lack of consistency
    }
  } else if (totalPayments > 0) {
    // For newer customers, partial penalty if they have any failure
    const hasFailure = payments.some((p) => p.status === "failed");
    if (hasFailure) {
      score -= 10;
    }
  }

  // Ensure score is bounded between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Determine grade based on score
  let grade: HealthGrade = "excellent";
  if (score < 40) {
    grade = "critical";
  } else if (score < 60) {
    grade = "at_risk";
  } else if (score < 80) {
    grade = "good";
  }

  return { score, grade };
}
