// PROPÓSITO: Configura las rutas HTTP para la suscripción a newsletters.
// RESPONSABILIDAD: Encapsula la lógica de suscripción y maneja la interacción con la infraestructura.
// DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
// SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
// NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SubscribeToNewsletterSchema } from "@/modules/Marketing/application/subscribe/SubscribeToNewsletterDTO";
import type { MarketingController } from "./MarketingController";

export function createMarketingRouter(controller: MarketingController) {
  const app = new Hono();

  app.post("/newsletter/subscribe", zValidator("json", SubscribeToNewsletterSchema), (c) =>
    controller.subscribeNewsletter(c)
  );

  return app;
}

