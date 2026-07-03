import { sleep } from "@/lib/utils";
import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResponse,
  ChargeParams,
  ChargeResponse,
  TransactionStatus,
} from "./payment-provider";

// ─── Mock Payment Provider ──────────────────────────────────
// Simulates Nomba's payment APIs with realistic delays and
// configurable failure scenarios. Used until July 1st integration window.

type FailureScenario = "none" | "insufficient_funds" | "gateway_timeout" | "bank_decline" | "card_expired";

interface MockConfig {
  /** Simulated response delay in ms (default: 1500) */
  delayMs: number;
  /** Force a specific failure scenario (default: random based on successRate) */
  forceFailure: FailureScenario;
  /** Success rate as decimal 0-1 (default: 0.7) */
  successRate: number;
}

const DEFAULT_CONFIG: MockConfig = {
  delayMs: 1500,
  forceFailure: "none",
  successRate: 0.7,
};

export class MockPaymentProvider implements PaymentProvider {
  private config: MockConfig;
  private tokenCounter: number = 1000;

  constructor(config?: Partial<MockConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getProviderName(): string {
    return "Mock Provider (Nomba Sandbox Simulation)";
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
    await sleep(this.config.delayMs);

    return {
      success: true,
      checkoutLink: `https://checkout.nomba.com/mock/${params.orderReference}`,
      orderReference: params.orderReference,
      transactionRef: `MOCK-TXN-${Date.now()}`,
    };
  }

  async chargeTokenizedCard(params: ChargeParams): Promise<ChargeResponse> {
    await sleep(this.config.delayMs + Math.random() * 500);

    // Determine if this charge should succeed or fail
    const shouldFail = this.config.forceFailure !== "none"
      ? true
      : Math.random() > this.config.successRate;

    if (shouldFail) {
      const reason = this.config.forceFailure !== "none"
        ? this.config.forceFailure
        : this.getRandomFailureReason();

      return {
        success: false,
        status: "failed",
        failureReason: reason,
        transactionRef: `MOCK-TXN-${Date.now()}`,
        error: this.getFailureMessage(reason),
      };
    }

    return {
      success: true,
      status: "success",
      transactionRef: `MOCK-TXN-${Date.now()}`,
    };
  }

  async verifyTransaction(transactionRef: string): Promise<TransactionStatus> {
    await sleep(800);

    const tokenKey = `MOCK-TOKEN-${++this.tokenCounter}`;

    return {
      status: "success",
      amount: 0,
      currency: "NGN",
      transactionRef,
      orderReference: `PF-${transactionRef}`,
      tokenKey,
    };
  }

  // ─── Configure for demo scenarios ─────────────────────────

  /** Force next charge to fail with a specific reason */
  setForceFailure(reason: FailureScenario): void {
    this.config.forceFailure = reason;
  }

  /** Set success rate for randomized outcomes */
  setSuccessRate(rate: number): void {
    this.config.successRate = Math.max(0, Math.min(1, rate));
  }

  /** Reset to default configuration */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
  }

  /** Configure for "always succeed" — useful for demo restoration */
  setAlwaysSucceed(): void {
    this.config.forceFailure = "none";
    this.config.successRate = 1;
  }

  /** Configure for "always fail" — useful for demo failure scenarios */
  setAlwaysFail(reason: FailureScenario = "insufficient_funds"): void {
    this.config.forceFailure = reason;
  }

  // ─── Private helpers ──────────────────────────────────────

  private getRandomFailureReason(): FailureScenario {
    const reasons: FailureScenario[] = [
      "insufficient_funds",
      "insufficient_funds", // Weighted — most common in Nigeria
      "insufficient_funds",
      "gateway_timeout",
      "bank_decline",
      "card_expired",
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private getFailureMessage(reason: FailureScenario): string {
    switch (reason) {
      case "insufficient_funds":
        return "Card charge declined: Insufficient funds in customer account";
      case "gateway_timeout":
        return "Payment gateway timeout: Bank did not respond within the expected timeframe";
      case "bank_decline":
        return "Bank declined the transaction: Contact issuing bank for details";
      case "card_expired":
        return "Card has expired: Customer needs to update payment method";
      default:
        return "Unknown payment error occurred";
    }
  }
}
