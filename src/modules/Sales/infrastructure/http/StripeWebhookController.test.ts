/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
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

    const controller = new StripeWebhookController(verifier, confirmPayment, new NullLogger(), "whsec_test");

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
});
