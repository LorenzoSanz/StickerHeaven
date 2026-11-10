/**
 * POR QUÉ: Si la API se sirve detrás de un reverse proxy, debe emitir HSTS en producción para forzar HTTPS.
 * QUÉ: Verifica que createApp añade Strict-Transport-Security cuando NODE_ENV=production.
 */
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
// Test suite que valida contratos críticos y previene regresiones.
describe("createApp (HSTS)", () => {
  it("adds Strict-Transport-Security header in production", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
  });
});
