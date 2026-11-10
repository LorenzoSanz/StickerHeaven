
import { describe, it, expect } from "bun:test";
import nextConfig from "./next.config";

// DESARROLLAR: Testear la configuración de CSP en next.config.

// Describe lo que se espera en producción.
describe("next.config CSP headers", () => {
  it("should not include unsafe-eval outside development", async () => {
    const env = process.env as Record<string, string | undefined>;
    const original = env.NODE_ENV;
    try {
      env.NODE_ENV = "test";
      const rules = await nextConfig.headers?.();
      const csp = rules?.[0]?.headers?.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
      expect(csp).not.toContain("'unsafe-eval'");
    } finally {
      env.NODE_ENV = original;
    }
  });
  
// Describe lo que se espera en desarrollo.
  it("should include unsafe-eval in development", async () => {
    const env = process.env as Record<string, string | undefined>;
    const original = env.NODE_ENV;
    try {
      env.NODE_ENV = "development";
      const rules = await nextConfig.headers?.();
      const csp = rules?.[0]?.headers?.find((h) => h.key === "Content-Security-Policy")?.value ?? "";
      expect(csp).toContain("'unsafe-eval'");
    } finally {
      env.NODE_ENV = original;
    }
  });
});
