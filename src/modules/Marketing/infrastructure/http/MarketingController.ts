// PROPÓSITO: Controlador HTTP para la suscripción a newsletters.
// RESPONSABILIDAD: Encapsula la lógica de suscripción y maneja la interacción con la infraestructura.
// DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
// SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
// NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.

import type { Context } from "hono";
import type { ILogger } from "@/shared/domain/ILogger";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import { SubscribeToNewsletter } from "@/modules/Marketing/application/subscribe/SubscribeToNewsletter";

export class MarketingController {
  constructor(
    private readonly subscribeToNewsletter: SubscribeToNewsletter,
    private readonly logger: ILogger
  ) {}

  async subscribeNewsletter(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();

      const result = await this.subscribeToNewsletter.execute({ email: body.email });
      if (result.isFailure) {
        this.logger.warn("Newsletter subscription failed", { error: result.error?.message });
        return c.json({ error: result.error?.message ?? "Solicitud inválida" }, HttpStatus.BAD_REQUEST);
      }

      return c.json({ ok: true }, HttpStatus.CREATED);
    } catch (error) {
      this.logger.error("Newsletter subscription error", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
