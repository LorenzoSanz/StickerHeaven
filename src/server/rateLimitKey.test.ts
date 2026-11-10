import { describe, expect, it } from "bun:test";
import { getRateLimitKey } from "./rateLimitKey";

function headers(values: Record<string, string>): Headers {
  return new Headers(values);
}

describe("getRateLimitKey", () => {
  it("uses the socket address when no proxy is trusted", () => {
    const key = getRateLimitKey(headers({ "x-forwarded-for": "9.9.9.9" }), {
      trustProxy: false,
      remoteAddress: "203.0.113.7",
    });
    expect(key).toBe("ip:203.0.113.7");
  });

  it("ignores cookies and User-Agent, so rotating them does not reset the quota", () => {
    const a = getRateLimitKey(headers({ "user-agent": "bot-1", cookie: "sessionId=a" }), {
      trustProxy: false,
      remoteAddress: "203.0.113.7",
    });
    const b = getRateLimitKey(headers({ "user-agent": "bot-2", cookie: "sessionId=b" }), {
      trustProxy: false,
      remoteAddress: "203.0.113.7",
    });
    expect(a).toBe(b);
  });

  it("uses the proxy header when the proxy is trusted", () => {
    const key = getRateLimitKey(headers({ "x-real-ip": "198.51.100.4" }), {
      trustProxy: true,
      remoteAddress: "10.0.0.2",
    });
    expect(key).toBe("ip:198.51.100.4");
  });

  it("falls back to one shared bucket when the address is unknown", () => {
    expect(getRateLimitKey(headers({ "user-agent": "x" }), { trustProxy: false })).toBe("ip:unknown");
  });
});
