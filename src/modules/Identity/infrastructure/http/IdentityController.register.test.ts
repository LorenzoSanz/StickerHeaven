import { describe, it, expect } from "bun:test";
import { Hono } from "hono";
import { IdentityController } from "./IdentityController";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { NullLogger } from "@/shared/infrastructure/logger/NullLogger";

describe("IdentityController.register", () => {
  it("should not return sessionId in JSON response body and should set HttpOnly cookie", async () => {
    const registerUser = {
      execute: async () => Result.ok<void, DomainError>(undefined),
    } as any;

    const loginUser = {
      execute: async () =>
        Result.ok({
          sessionId: "sess_test_123",
          user: { id: "user_test_1", email: "a@b.com" },
        }),
    } as any;

    const controller = new IdentityController(
      registerUser,
      loginUser,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => Result.ok<void, DomainError>(undefined) } as any,
      { execute: async () => undefined } as any,
      { getSessionUser: async () => null } as any,
      new NullLogger()
    );

    const app = new Hono();
    app.post("/auth/register", (c) => controller.register(c));

    const res = await app.request("/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "a@b.com", name: "A", password: "Password123!" }),
    });

    expect(res.status).toBe(201);

    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("sessionId=");
    expect(cookie.toLowerCase()).toContain("httponly");

    const json = await res.json();
    expect(json).not.toHaveProperty("sessionId");
  });
});
