
import { Hono, MiddlewareHandler } from "hono";
import { zValidator } from "@hono/zod-validator";
import { CartController } from "./CartController";
import { AddItemToCartSchema } from "../../application/add-item/AddItemToCartDTO";
import { z } from "zod";

const ItemIdParamSchema = z.object({
  id: z.string().min(1),
});

const UpdateItemQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});

export const createCartRouter = (
  controller: CartController,
  authMiddleware: MiddlewareHandler
) => {
  const router = new Hono();

  // Aplica middleware de autenticación a todas las rutas
  router.use("*", authMiddleware); 

  router.get("/", (c) => controller.get(c));
  router.delete("/", (c) => controller.clear(c));
  router.post("/items", zValidator("json", AddItemToCartSchema), (c) => controller.addItem(c));
  router.patch(
    "/items/:id",
    zValidator("param", ItemIdParamSchema),
    zValidator("json", UpdateItemQuantitySchema),
    (c) => controller.updateItem(c)
  );
  router.delete("/items/:id", zValidator("param", ItemIdParamSchema), (c) => controller.removeItem(c));

  return router;
};
