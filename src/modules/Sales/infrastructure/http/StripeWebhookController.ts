/**
 * POR QUÉ: Gestiona eventos de webhook de Stripe (e.g., payment_intent.succeeded).
 * INTEGRIDAD: Valida firma de Stripe y delega en la capa Application para mutar el estado del pedido.
 * FLUJO: Stripe → POST /api/orders/webhook (ruta montada en SalesRoutes) → ConfirmPayment → subscribers/eventos internos.
 * SEGURIDAD: No filtra detalles internos en la respuesta; los errores se registran en servidor.
 * ESTRUCTURA: Capa Infrastructure - HTTP Controller.
 */
import { Context } from "hono";
import { ConfirmPayment } from "@/modules/Sales/application/confirm-payment/ConfirmPayment";
import { ILogger } from "@/shared/domain/ILogger";

import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";

export interface WebhookEventVerifier {
    constructEvent(payload: string | Buffer, signature: string, secret: string): unknown;
}

interface StripeEvent {
    type: string;
    data: {
        object: unknown;
    };
}

const isStripeEvent = (v: unknown): v is StripeEvent => {
  if (!v || typeof v !== "object") return false;
  const event = v as Record<string, unknown>;
  if (typeof event.type !== "string") return false;
  const data = event.data as Record<string, unknown> | undefined;
  if (!data || typeof data !== "object") return false;
  return "object" in data;
};

/**
 * POR QUÉ: El webhook es el “source of truth” de pago; el backend debe confirmar el pedido solo cuando Stripe lo indique.
 * QUÉ: Verifica la firma, valida el shape mínimo del evento y procesa payment_intent.succeeded.
 * CONTRATO: Responde `{ received: true }` para que Stripe considere entregado; otros eventos se ignoran de forma segura.
 */
export class StripeWebhookController {
  constructor(
    private stripeGateway: WebhookEventVerifier,
    private confirmPayment: ConfirmPayment,
    private logger: ILogger,
    private webhookSecret: string
  ) {}

  async handleWebhook(c: Context) {
    const signature = c.req.header("stripe-signature");
    
    if (!signature) {
      this.logger.error("Missing Stripe signature");
      return c.json({ error: "Falta la firma de Stripe" }, HttpStatus.BAD_REQUEST);
    }

    try {
      const body = await c.req.text();
      const rawEvent = this.stripeGateway.constructEvent(body, signature, this.webhookSecret);
      if (!isStripeEvent(rawEvent)) {
        this.logger.error("Invalid webhook event shape");
        return c.json({ error: "Evento de webhook inválido" }, HttpStatus.BAD_REQUEST);
      }
      const event = rawEvent;

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as { id?: unknown };
        if (typeof paymentIntent?.id !== "string") {
          this.logger.error("Webhook payload missing payment intent id");
          return c.json({ error: "Payload de webhook inválido" }, HttpStatus.BAD_REQUEST);
        }
        this.logger.info(`Payment succeeded for intent: ${paymentIntent.id}`);
        
        const result = await this.confirmPayment.execute({
          paymentIntentId: paymentIntent.id,
        });

        if (result.isFailure) {
            this.logger.error("Failed to confirm payment", { error: result.error?.message });
            return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        // POR QUÉ: Aceptamos solo el evento que impacta nuestro dominio; el resto se ignora para evitar efectos no deseados.
      }

      return c.json({ received: true });
    } catch (err: unknown) {
      this.logger.error("Webhook Error", { error: err instanceof Error ? err.message : String(err) });
      return c.json({ error: "Error de webhook" }, HttpStatus.BAD_REQUEST);
    }
  }
}
