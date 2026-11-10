/**
 * POR QUÉ: Routes for Catalog module.
 * INTEGRIDAD: Configura endpoints. La inyección de dependencias la gestiona quien llama (server.ts).
 * ESTRUCTURA: Capa de infraestructura - Routes.
 */
import { Hono, MiddlewareHandler } from "hono";
import { zValidator } from "@hono/zod-validator";
import { StickerController } from "./StickerController";
import { z } from "zod";
import { requireAuth } from "@/shared/infrastructure/http/requireAuth";

// Esquema para validar el parámetro de ID de sticker.
const StickerIdParamSchema = z.object({
  id: z.string().min(1),
});

export const createCatalogRouter = (
  controller: StickerController,
  authMiddleware: MiddlewareHandler
) => {
  const router = new Hono();

  // Public Routes
  router.get("/", (c) => controller.list(c));
  router.get("/search", (c) => controller.search(c)); // Search before :id to avoid conflict
  router.get("/:id", zValidator("param", StickerIdParamSchema), (c) => controller.getById(c));

  // Protected Routes
  router.post("/", authMiddleware, requireAuth, (c) => controller.create(c));
  router.patch(
    "/:id",
    authMiddleware,
    requireAuth,
    zValidator("param", StickerIdParamSchema),
    (c) => controller.update(c)
  );
  router.delete("/:id", authMiddleware, requireAuth, zValidator("param", StickerIdParamSchema), (c) => controller.delete(c));

  return router;
};
