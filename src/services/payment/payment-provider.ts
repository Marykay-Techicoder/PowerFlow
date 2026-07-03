// ─── Payment Provider Interface ─────────────────────────────
// This is the core abstraction that allows swapping between
// MockPaymentProvider (before July 1) and NombaPaymentProvider (after July 1).
// Everything above this interface is identical regardless of provider.

export interface CheckoutParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  orderReference: string;
  tokenizeCard: boolean;
  callbackUrl?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutLink: string;
  orderReference: string;
  transactionRef?: string;
  error?: string;
}

export interface ChargeParams {
  tokenKey: string;
  amount: number;
  currency: string;
  customerEmail: string;
  orderReference: string;
}

export interface ChargeResponse {
  success: boolean;
  transactionRef?: string;
  status: "success" | "failed" | "pending";
  failureReason?: string;
  error?: string;
}

export interface TransactionStatus {
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  transactionRef: string;
  orderReference: string;
  tokenKey?: string; // Returned on successful tokenization
}

export interface PaymentProvider {
  /**
   * Create a checkout order (initial payment + card tokenization).
   * Maps to Nomba: POST /v1/checkout/order with tokenizeCard: true
   */
  createCheckout(params: CheckoutParams): Promise<CheckoutResponse>;

  /**
   * Charge a tokenized card for recurring billing.
   * Maps to Nomba: POST /v1/checkout/tokenized-card-payment
   */
  chargeTokenizedCard(params: ChargeParams): Promise<ChargeResponse>;

  /**
   * Verify a transaction status.
   * Maps to Nomba: GET /v1/transactions/accounts/single
   */
  verifyTransaction(transactionRef: string): Promise<TransactionStatus>;

  /**
   * Get provider name for display purposes.
   */
  getProviderName(): string;
}

import { MockPaymentProvider } from "./mock-payment-provider";
import { NombaPaymentProvider } from "./nomba-provider";

let providerInstance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (!providerInstance) {
    const useRealNomba = process.env.NEXT_PUBLIC_USE_REAL_NOMBA === "true" || process.env.USE_REAL_NOMBA === "true";
    if (useRealNomba) {
      providerInstance = new NombaPaymentProvider();
    } else {
      providerInstance = new MockPaymentProvider();
    }
  }
  return providerInstance;
}
