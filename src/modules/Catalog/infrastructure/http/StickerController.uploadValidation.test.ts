import { describe, it, expect } from "bun:test";
import { Hono } from "hono";
import { StickerController } from "./StickerController";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { NullLogger } from "@/shared/infrastructure/logger/NullLogger";

function createAppWithUser(controller: StickerController) {
  const app = new Hono<{ Variables: { userId: string } }>();
  app.use("*", async (c, next) => {
    c.set("userId", "user_test_1");
    await next();
  });
  app.post("/stickers", (c) => controller.create(c));
  app.put("/stickers/:id", (c) => controller.update(c));
  return app;
}

// Pruebas para validación de carga de stickers.
describe("StickerController upload validation", () => {
  it("should reject non-image uploads on create and not call use case", async () => {
    let called = false;
    const controller = new StickerController(
      {
        execute: async () => {
          called = true;
          return Result.ok<{ id: string }, DomainError>({ id: "s1" });
        },
      } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      { execute: async () => Result.ok<any, DomainError>({}) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { search: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      new NullLogger()
    );

    const app = createAppWithUser(controller);

    const form = new FormData();
    form.set("image", new File(["not-an-image"], "a.txt", { type: "text/plain" }));

    const res = await app.request("/stickers", { method: "POST", body: form });
    expect(res.status).toBe(400);
    expect(called).toBe(false);
  });

  it("should reject oversized uploads on create and not call use case", async () => {
    let called = false;
    const controller = new StickerController(
      {
        execute: async () => {
          called = true;
          return Result.ok<{ id: string }, DomainError>({ id: "s1" });
        },
      } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      { execute: async () => Result.ok<any, DomainError>({}) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { search: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      new NullLogger()
    );

    const app = createAppWithUser(controller);

    const big = new Uint8Array(6 * 1024 * 1024);
    const form = new FormData();
    form.set("image", new File([big], "big.png", { type: "image/png" }));

    const res = await app.request("/stickers", { method: "POST", body: form });
    expect(res.status).toBe(400);
    expect(called).toBe(false);
  });

  it("should reject non-image uploads on update and not call use case", async () => {
    let called = false;
    const controller = new StickerController(
      { execute: async () => Result.ok<{ id: string }, DomainError>({ id: "s1" }) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      {
        execute: async () => {
          called = true;
          return Result.ok<void, DomainError>(undefined);
        },
      } as any,
      { execute: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      { execute: async () => Result.ok<any, DomainError>({}) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { search: async () => Result.ok<any, DomainError>({ items: [] }) } as any,
      new NullLogger()
    );

    const app = createAppWithUser(controller);

    // Prueba de carga no válida en la actualización.
    const form = new FormData();
    form.set("image", new File(["not-an-image"], "a.txt", { type: "text/plain" }));

    const res = await app.request("/stickers/s1", { method: "PUT", body: form });
    expect(res.status).toBe(400);
    expect(called).toBe(false);
  });
});
