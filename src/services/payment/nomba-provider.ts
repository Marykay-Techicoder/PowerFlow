// ─── Nomba Payment Provider (Skeleton) ──────────────────────
// This file will be implemented during the July 1-7 integration window.
// DO NOT add real Nomba API calls until then.
//
// Nomba API Reference:
// - Create Checkout:      POST /v1/checkout/order (with tokenizeCard: true)
// - Charge Tokenized:     POST /v1/checkout/tokenized-card-payment
// - Verify Transaction:   GET  /v1/transactions/accounts/single
// - Sandbox Base URL:     https://sandbox.nomba.com
// - Production Base URL:  https://api.nomba.com
//
// Auth: OAuth2 Bearer token (Client Credentials flow)
// Headers: Authorization: Bearer <token>, accountId: <account_id>

import type {
  PaymentProvider,
  CheckoutParams,
  CheckoutResponse,
  ChargeParams,
  ChargeResponse,
  TransactionStatus,
} from "./payment-provider";

export class NombaPaymentProvider implements PaymentProvider {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accountId: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor() {
    this.baseUrl = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";
    this.clientId = process.env.NOMBA_CLIENT_ID || "";
    this.clientSecret = process.env.NOMBA_CLIENT_SECRET || "";
    this.accountId = process.env.NOMBA_ACCOUNT_ID || "";
  }

  getProviderName(): string {
    return "Nomba";
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResponse> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/v1/checkout/order`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "accountId": this.accountId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: {
            amount: params.amount.toString(),
            currency: params.currency,
            orderReference: params.orderReference,
            customerEmail: params.customerEmail,
            customerId: params.customerEmail,
            callbackUrl: params.callbackUrl || "http://localhost:3000/dashboard/subscriptions",
            allowedPaymentMethods: ["Card", "Transfer"],
          },
          tokenizeCard: params.tokenizeCard,
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          checkoutLink: "",
          orderReference: params.orderReference,
          error: `Nomba Checkout API returned error: ${res.statusText}`,
        };
      }

      const body = await res.json();
      if (body.code !== "00" || !body.data?.checkoutLink) {
        return {
          success: false,
          checkoutLink: "",
          orderReference: params.orderReference,
          error: body.description || "Checkout generation failed",
        };
      }

      return {
        success: true,
        checkoutLink: body.data.checkoutLink,
        orderReference: params.orderReference,
        transactionRef: body.data.transactionId || body.data.transactionRef || undefined,
      };
    } catch (e: any) {
      console.error("[Nomba Provider] createCheckout failed", e);
      return {
        success: false,
        checkoutLink: "",
        orderReference: params.orderReference,
        error: e.message || "Unknown error during checkout generation",
      };
    }
  }

  async chargeTokenizedCard(params: ChargeParams): Promise<ChargeResponse> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(`${this.baseUrl}/v1/checkout/tokenized-card-payment`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "accountId": this.accountId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenKey: params.tokenKey,
          order: {
            amount: params.amount.toString(),
            currency: params.currency,
            orderReference: params.orderReference,
            customerEmail: params.customerEmail,
            customerId: params.customerEmail,
          },
        }),
      });

      if (!res.ok) {
        return {
          success: false,
          status: "failed",
          error: `Nomba tokenized payment declined: ${res.statusText}`,
        };
      }

      const body = await res.json();
      const isSuccess = body.code === "00";
      
      return {
        success: isSuccess,
        status: isSuccess ? "success" : "failed",
        transactionRef: body.data?.transactionId || body.data?.transactionRef || undefined,
        failureReason: isSuccess ? undefined : (body.description || "decline"),
      };
    } catch (e: any) {
      console.error("[Nomba Provider] chargeTokenizedCard failed", e);
      return {
        success: false,
        status: "failed",
        error: e.message || "Unknown error during token card payment",
      };
    }
  }

  async verifyTransaction(transactionRef: string): Promise<TransactionStatus> {
    try {
      const token = await this.getAccessToken();
      // Determine if query parameter is orderReference or transactionRef.
      const isOrderRef = transactionRef.startsWith("PF-") || transactionRef.includes("ORDER");
      const queryParam = isOrderRef ? `orderReference=${transactionRef}` : `transactionRef=${transactionRef}`;

      const res = await fetch(`${this.baseUrl}/v1/transactions/accounts/single?${queryParam}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "accountId": this.accountId,
        },
      });

      if (!res.ok) {
        throw new Error(`Nomba verification returned status: ${res.statusText}`);
      }

      const body = await res.json();
      if (body.code !== "00" || !body.data) {
        throw new Error(`Nomba verification response invalid: ${body.description || "No data"}`);
      }

      const data = body.data;
      const statusStr = data.status;
      
      let status: "success" | "failed" | "pending" = "pending";
      if (statusStr === "SUCCESS") {
        status = "success";
      } else if (statusStr === "FAILED") {
        status = "failed";
      }

      return {
        status,
        amount: parseFloat(data.amount || "0"),
        currency: data.currency || "NGN",
        transactionRef: data.id || data.transactionRef || transactionRef,
        orderReference: data.orderReference || transactionRef,
        tokenKey: data.tokenKey || undefined,
      };
    } catch (e: any) {
      console.error("[Nomba Provider] verifyTransaction failed", e);
      throw e;
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    try {
      const res = await fetch(`${this.baseUrl}/v1/auth/token/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accountId": this.accountId,
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      if (!res.ok) {
        throw new Error(`Nomba auth failed: ${res.statusText}`);
      }

      const body = await res.json();
      if (body.code !== "00" || !body.data?.access_token) {
        throw new Error(`Nomba auth response invalid: ${body.description || "Unknown error"}`);
      }

      this.accessToken = body.data.access_token;
      if (body.data.expiresAt) {
        this.tokenExpiresAt = new Date(body.data.expiresAt);
      } else {
        this.tokenExpiresAt = new Date(Date.now() + 25 * 60 * 1000);
      }

      return this.accessToken!;
    } catch (e: any) {
      console.error("[Nomba Provider] Failed to acquire auth token", e);
      throw e;
    }
  }
}
