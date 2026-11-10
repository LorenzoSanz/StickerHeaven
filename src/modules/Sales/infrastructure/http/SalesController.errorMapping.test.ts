import { beforeAll, describe, expect, it } from "bun:test";
import { Hono } from "hono";
import { applyTestEnv } from "@/config/testEnv";
import { Result } from "@/shared/domain/Result";
import { NullLogger } from "@/shared/infrastructure/logger/NullLogger";
import {
  InsufficientStockError,
  ProductNotFoundError,
  UnauthorizedOrderAccessError,
} from "@/modules/Sales/domain/Errors";

describe("SalesController error mapping", () => {
  let SalesController: typeof import("./SalesController").SalesController;

  beforeAll(async () => {
    applyTestEnv();
    ({ SalesController } = await import("./SalesController"));
  });

  it("maps ProductNotFoundError to 404 even without keyword in message", async () => {
    const controller = new SalesController(
      { execute: async () => Result.fail(new ProductNotFoundError("p1", "missing")) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      new NullLogger()
    );

    const app = new Hono<{ Variables: { userId: string | undefined } }>();
    app.use("*", async (c, next) => {
      c.set("userId", "u1");
      await next();
    });
    app.post("/orders", (c) => controller.create(c));

    const res = await app.request("/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });

    expect(res.status).toBe(404);
  });

  it("maps InsufficientStockError to 409 even without keyword in message", async () => {
    const controller = new SalesController(
      { execute: async () => Result.fail(new InsufficientStockError("p1", 1, 0, "nope")) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      new NullLogger()
    );

    const app = new Hono<{ Variables: { userId: string | undefined } }>();
    app.use("*", async (c, next) => {
      c.set("userId", "u1");
      await next();
    });
    app.post("/orders", (c) => controller.create(c));

    const res = await app.request("/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });

    expect(res.status).toBe(409);
  });

  it("maps UnauthorizedOrderAccessError to 403 even without keyword in message", async () => {
    const controller = new SalesController(
      {} as any,
      {} as any,
      {} as any,
      { execute: async () => Result.fail(new UnauthorizedOrderAccessError("no")) } as any,
      {} as any,
      new NullLogger()
    );

    const app = new Hono<{ Variables: { userId: string | undefined } }>();
    app.use("*", async (c, next) => {
      c.set("userId", "u1");
      await next();
    });
    app.get("/orders/o1", (c) => controller.getById(c));

    const res = await app.request("/orders/o1", { method: "GET" });
    expect(res.status).toBe(403);
  });
});
