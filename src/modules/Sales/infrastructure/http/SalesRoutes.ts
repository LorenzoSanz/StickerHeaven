/**
 * POR QUÉ: Sales HTTP Router.
 * INTEGRIDAD: Maps HTTP requests to Sales controller actions.
 * ESTRUCTURA: Capa de infraestructura - Router.
 */
import { Hono, MiddlewareHandler } from "hono";
import { zValidator } from "@hono/zod-validator";
import { SalesController } from "./SalesController";
import { StripeWebhookController } from "./StripeWebhookController";
import { CreateOrderSchema } from "../../application/create-order/CreateOrderDTO";
import { z } from "zod";
import { requireAuth } from "@/shared/infrastructure/http/requireAuth";

const OrderIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createSalesRouter = (
  controller: SalesController,
  webhookController: StripeWebhookController,
  authMiddleware: MiddlewareHandler
) => {
  const router = new Hono();

  // Public Webhooks (No Auth)
  router.post("/webhook/stripe", (c) => webhookController.handleWebhook(c));

  // Protected Routes
  router.post("/checkout", authMiddleware, requireAuth, (c) => controller.checkout(c));
  router.post("/", authMiddleware, requireAuth, zValidator("json", CreateOrderSchema), (c) => controller.create(c));
  router.post("/:id/cancel", authMiddleware, requireAuth, zValidator("param", OrderIdParamSchema), (c) => controller.cancel(c));
  router.get("/", authMiddleware, requireAuth, (c) => controller.list(c));
  router.get("/:id", authMiddleware, requireAuth, zValidator("param", OrderIdParamSchema), (c) => controller.getById(c));

  return router;
};
