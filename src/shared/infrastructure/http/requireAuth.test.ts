// PROPÓSITO: Testea el middleware `requireAuth` para verificar que retorna 401 cuando `userId` no está presente en el contexto.

import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { requireAuth } from "./requireAuth";

// POR QUÉ: Testea el middleware `requireAuth` para verificar que retorna 401 cuando `userId` no está presente en el contexto.
// INTEGRIDAD: Asegura que el middleware `requireAuth` funcione correctamente y retorne 401 cuando `userId` no está presente en el contexto.
describe("requireAuth", () => {
  it("returns 401 when userId is missing", async () => {
    const app = new Hono<{ Variables: { userId: string | undefined } }>();
    app.get("/p", requireAuth, (c) => c.json({ ok: true }, 200));

    const res = await app.request("/p");
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });

  /**
   * POR QUÉ: Testea el middleware `requireAuth` para verificar que permite la solicitud cuando `userId` está presente en el contexto.
   * INTEGRIDAD: Asegura que el middleware `requireAuth` funcione correctamente y permita el acceso a la ruta protegida.
   */
  it("allows request when userId is present", async () => {
    const app = new Hono<{ Variables: { userId: string | undefined } }>();
    app.get(
      "/p",
      async (c, next) => {
        c.set("userId", "u1");
        await next();
      },
      requireAuth,
      (c) => c.json({ ok: true }, 200)
    );

    const res = await app.request("/p");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
