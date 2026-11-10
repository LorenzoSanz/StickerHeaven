import { describe, expect, it } from "bun:test";
import type { MiddlewareHandler } from "hono";
import { createIdentityRouter } from "./identity.routes";

describe("identity.routes auth", () => {
  it("blocks /me when auth middleware does not set userId", async () => {
    const authMiddleware: MiddlewareHandler = async (_c, next) => {
      await next();
    };

    const controller = {
      register: (c: any) => c.json({ ok: true }, 200),
      login: (c: any) => c.json({ ok: true }, 200),
      logout: (c: any) => c.json({ ok: true }, 200),
      me: (c: any) => c.json({ ok: true }, 200),
      updateProfile: (c: any) => c.json({ ok: true }, 200),
      changePassword: (c: any) => c.json({ ok: true }, 200),
    };

    const router = createIdentityRouter(controller as any, authMiddleware);

    const res = await router.request("/me", { method: "GET" });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });
});
