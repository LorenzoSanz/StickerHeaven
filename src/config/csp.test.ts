import { describe, expect, it } from "bun:test";
import { buildCsp } from "./csp";
import nextConfig from "../../next.config";

describe("buildCsp", () => {
  it("allows scripts only with the request nonce, never inline", () => {
    const csp = buildCsp("abc123", false);
    const scriptSrc = csp.split("; ").find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
  });

  it("adds unsafe-eval only in development, for React Refresh", () => {
    expect(buildCsp("n", true)).toContain("'unsafe-eval'");
  });

  it("is not also set statically in next.config, which would add a second, looser policy", async () => {
    const rules = await nextConfig.headers?.();
    const keys = rules?.[0]?.headers?.map((h) => h.key) ?? [];
    expect(keys).not.toContain("Content-Security-Policy");
    expect(keys).toContain("X-Frame-Options");
  });
});
