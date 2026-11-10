
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

