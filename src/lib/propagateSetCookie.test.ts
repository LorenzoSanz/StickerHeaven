/**
 * POR QUÉ: Necesitamos garantizar que la propagación de Set-Cookie a cookies() sea determinista y compatible.
 * QUÉ: Testea extracción de cookie, normalización sameSite y soporte de getSetCookie()/set-cookie.
 */
import { describe, expect, test } from "bun:test";
import { propagateCookieFromResponse } from "./propagateSetCookie";

// PROPÓSITO: Crea un stub para simular el comportamiento de cookieStore.set().
function createCookieStoreStub() {
  const setCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  return {
    set: (name: string, value: string, options: Record<string, unknown>) => {
      setCalls.push({ name, value, options });
    },
    getCalls: () => setCalls,
  };
}

// PROPÓSITO: Testea la extracción de cookie de set-cookie header fallback.
describe("propagateCookieFromResponse", () => {
  test("extracts cookie from set-cookie header fallback", () => {
    const res = new Response(null, {
      headers: {
        "set-cookie": "sessionId=abc123; Path=/; HttpOnly; SameSite=Strict",
      },
    });
    const cookieStore = createCookieStoreStub();

    const didSet = propagateCookieFromResponse({
      res,
      cookieStore: cookieStore as unknown as any,
      cookieName: "sessionId",
      options: { path: "/", httpOnly: true, secure: false, sameSite: "Strict", maxAge: 3600 },
    });

    expect(didSet).toBe(true);
    expect(cookieStore.getCalls()).toEqual([
      {
        name: "sessionId",
        value: "abc123",
        options: expect.objectContaining({ path: "/", httpOnly: true, secure: false, sameSite: "strict", maxAge: 3600 }),
      },
    ]);
  });

  // PROPÓSITO: Testea soporte para headers.getSetCookie() cuando está presente.
  test("supports headers.getSetCookie() when present", () => {
    const res = new Response(null);
    (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie = () => [
      "sessionId=xyz; Path=/; HttpOnly; SameSite=Strict",
    ];
    const cookieStore = createCookieStoreStub();

    const didSet = propagateCookieFromResponse({
      res,
      cookieStore: cookieStore as unknown as any,
      cookieName: "sessionId",
      options: { sameSite: "Strict" },
    });

    expect(didSet).toBe(true);
    expect(cookieStore.getCalls()[0]?.value).toBe("xyz");
  });
});

