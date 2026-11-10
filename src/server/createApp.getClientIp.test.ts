import { describe, it, expect } from "bun:test";
import { getClientIp } from "./getClientIp";

// Test suite que valida contratos críticos y previene regresiones.
// No valida la validez de la IP; asume que el encabezado es correcto.
describe("getClientIp", () => {
  it("should return unknown when TRUST_PROXY is disabled", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "5.6.7.8",
      "cf-connecting-ip": "9.9.9.9",
    });

    expect(getClientIp(headers, false)).toBe("unknown");
  });
});
