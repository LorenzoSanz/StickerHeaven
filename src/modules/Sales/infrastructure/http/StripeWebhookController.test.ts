import { describe, it, expect } from "bun:test";
import { Hono } from "hono";
import { StripeWebhookController, type WebhookEventVerifier } from "./StripeWebhookController";
import { NullLogger } from "@/shared/infrastructure/logger/NullLogger";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

describe("StripeWebhookController", () => {
  it("should not leak internal error details in webhook responses", async () => {
    const verifier: WebhookEventVerifier = {
      constructEvent: () => {
        throw new Error("signature mismatch");
      },
    };

    const confirmPayment = {
      execute: async () => Result.ok<void, DomainError>(undefined),
    } as any;

    const releaseUnpaidOrders = { releaseByPaymentIntent: async () => Result.ok<boolean, DomainError>(false) };

    const controller = new StripeWebhookController(verifier, confirmPayment, releaseUnpaidOrders, new NullLogger(), "whsec_test");

    const app = new Hono();
    app.post("/webhook/stripe", (c) => controller.handleWebhook(c));

    const res = await app.request("/webhook/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=abc" },
      body: "raw",
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toEqual({ error: "Error de webhook" });
    expect(JSON.stringify(json)).not.toContain("signature mismatch");
  });

  it("releases the order when Stripe reports a canceled PaymentIntent", async () => {
    const verifier: WebhookEventVerifier = {
      constructEvent: () => ({ type: "payment_intent.canceled", data: { object: { id: "pi_42" } } }),
    };
    const released: string[] = [];
    const releaseUnpaidOrders = {
      releaseByPaymentIntent: async (id: string) => {
        released.push(id);
        return Result.ok<boolean, DomainError>(true);
      },
    };
    const confirmPayment = { execute: async () => Result.ok<void, DomainError>(undefined) } as any;
    const controller = new StripeWebhookController(verifier, confirmPayment, releaseUnpaidOrders, new NullLogger(), "whsec_test");

    const app = new Hono();
    app.post("/webhook/stripe", (c) => controller.handleWebhook(c));
    const res = await app.request("/webhook/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=abc" },
      body: "raw",
    });

    expect(res.status).toBe(200);
    expect(released).toEqual(["pi_42"]);
  });
});
