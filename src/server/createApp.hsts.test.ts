import { describe, expect, it, beforeAll } from "bun:test";
import { applyTestEnv } from "@/config/testEnv";

let createApp: typeof import("./createApp").createApp;
// Asegurarse de que createApp se importa antes de cada test
beforeAll(async () => {
  applyTestEnv({
    NODE_ENV: "production",
    ALLOWED_ORIGINS: "https://app.example.com",
  });

  const mod = await import("./createApp");
  createApp = mod.createApp;
});
describe("createApp (HSTS)", () => {
  it("adds Strict-Transport-Security header in production", async () => {
    const app = createApp();
    // No database in this test: /health now answers 500 in production, which is correct.
    // The header has to be present either way.
    const res = await app.request("/health");
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
  });
});
