import Stripe from "stripe";
import { PaymentGateway, CreatePaymentIntentResult } from "../../domain/gateways/PaymentGateway";
import { Money } from "@/shared/domain/Money";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export class StripePaymentGateway implements PaymentGateway {
  private stripe: Stripe;
  private static currencyExponent: Record<string, number> = {
    BHD: 3,
    JOD: 3,
    KWD: 3,
    OMR: 3,
    TND: 3,
    JPY: 0,
    KRW: 0,
    VND: 0,
    CLP: 0,
    PYG: 0,
    UGX: 0,
    VUV: 0,
    XOF: 0,
    XAF: 0,
    XPF: 0,
  };

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover", // Fijado para que coincida con los tipos del SDK instalado
    });
  }

  private toSmallestUnit(amount: Money): number {
    const currency = amount.currency.toUpperCase();
    const exponent = StripePaymentGateway.currencyExponent[currency] ?? 2;
    const factor = 10 ** exponent;
    return Math.round(amount.amount * factor);
  }

  async createPaymentIntent(
    amount: Money,
    metadata: Record<string, string>
  ): Promise<Result<CreatePaymentIntentResult, DomainError>> {
    try {
      const amountInCents = this.toSmallestUnit(amount);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInCents,
        currency: amount.currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      if (!paymentIntent.client_secret) {
        return Result.fail(new DomainError("Stripe failed to return a client secret"));
      }

      return Result.ok({
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return Result.fail(new DomainError(`Stripe Error: ${errorMessage}`));
    }
  }

  async cancelPaymentIntent(id: string): Promise<Result<void, DomainError>> {
    try {
      await this.stripe.paymentIntents.cancel(id);
      return Result.ok();
    } catch (error: unknown) {
      // Si ya está cancelado o ha tenido éxito, quizá queramos ignorarlo o registrarlo.
      // Por ahora devolvemos fallo para que quien llama decida (o lo registre).
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return Result.fail(new DomainError(`Stripe Cancel Error: ${errorMessage}`));
    }
  }

  async refundPayment(paymentIntentId: string): Promise<Result<void, DomainError>> {
    try {
      await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return Result.ok();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return Result.fail(new DomainError(`Stripe Refund Error: ${errorMessage}`));
    }
  }
  
  // Método para construir el evento para la validación de webhooks
  constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
