/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 */
import { describe, it, expect, beforeAll } from "bun:test";
import { applyTestEnv } from "@/config/testEnv";
import { Hono } from "hono";

let createApp: typeof import("./createApp").createApp;

beforeAll(async () => {
  applyTestEnv();

  const mod = await import("./createApp");
  createApp = mod.createApp;
});

function createTestRouters() {
  const stickers = new Hono().get("/", (c) => c.json({ ok: true }, 200));
  const orders = new Hono().get("/", (c) => c.json({ error: "No autorizado" }, 401));
  const cart = new Hono().delete("/", (c) => c.json({ ok: true }, 200));
  const auth = new Hono().post("/logout", (c) => {
    const accept = c.req.header("accept") ?? "";
    if (accept.includes("text/html")) {
      return c.redirect("/", 303);
    }
    return c.json({ message: "Cierre de sesión correcto" }, 200);
  });
  return { auth, stickers, orders, cart };
}

describe("createApp", () => {
  it("should expose a health endpoint", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.database).toBeDefined();
  });

  it("should return a unified error shape", async () => {
    const app = createApp();
    app.get("/boom", () => {
      throw new Error("boom");
    });

    const res = await app.request("/boom");

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Error interno del servidor" });
  });

  it("should rate-limit requests per client IP", async () => {
    const app = createApp({ routers: createTestRouters() });

    let last: Response | null = null;
    for (let i = 0; i < 101; i += 1) {
      last = await app.request("/api/stickers", {
        method: "GET",
        headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
      });
    }

    expect(last).not.toBeNull();
    expect(last!.status).toBe(429);
    expect(last!.headers.get("retry-after")).toBeTruthy();
  });

  it("should block cross-site unsafe requests when cookies are present", async () => {
    const app = createApp();
    app.post("/mut", () => new Response("ok"));

    const res = await app.request("/mut", {
      method: "POST",
      headers: {
        cookie: "session=abc",
        "sec-fetch-site": "cross-site",
        origin: "https://evil.example",
      },
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Prohibido" });
  });

  it("should block unsafe cookie requests without origin or referer", async () => {
    const app = createApp();
    app.post("/mut", () => new Response("ok"));

    const res = await app.request("/mut", {
      method: "POST",
      headers: {
        cookie: "session=abc",
      },
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Prohibido" });
  });

  it("should allow same-site unsafe requests when origin matches allowlist", async () => {
    const app = createApp();
    app.post("/mut", () => new Response("ok"));

    const res = await app.request("/mut", {
      method: "POST",
      headers: {
        cookie: "session=abc",
        "sec-fetch-site": "same-origin",
        origin: "http://localhost:3000",
      },
    });

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("should serve a public route and a protected route without crashing", async () => {
    const app = createApp({ routers: createTestRouters() });

    const publicRes = await app.request("/api/stickers", { method: "GET" });
    expect(publicRes.status).toBe(200);

    const protectedRes = await app.request("/api/orders", { method: "GET" });
    expect([401, 404]).toContain(protectedRes.status);
  });

  it("should expose cart clear endpoint without crashing", async () => {
    const app = createApp({ routers: createTestRouters() });

    const res = await app.request("/api/cart", { method: "DELETE" });
    expect(res.status).toBe(200);
  });

  it("should redirect to landing on logout for browser navigations", async () => {
    const app = createApp({ routers: createTestRouters() });

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      redirect: "manual",
      headers: {
        accept: "text/html",
      },
    });

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/");
  });

  it("should return JSON on logout for API clients", async () => {
    const app = createApp({ routers: createTestRouters() });

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: "Cierre de sesión correcto" });
  });
});
