// PROPÓSITO: Testea la extracción de mensajes de error de Responses.

import { describe, expect, it } from "bun:test";
import { readErrorMessage } from "@/lib/readErrorMessage";

describe("readErrorMessage", () => {
  it("prefers json.error", async () => {
    const res = new Response(JSON.stringify({ error: "boom" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });

    expect(await readErrorMessage(res)).toBe("boom");
  });

  it("falls back to json.message", async () => {
    const res = new Response(JSON.stringify({ message: "nope" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });

    expect(await readErrorMessage(res)).toBe("nope");
  });

  it("falls back to text", async () => {
    const res = new Response("plain text error", { status: 500 });
    expect(await readErrorMessage(res)).toBe("plain text error");
  });
});
