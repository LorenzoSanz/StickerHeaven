import { describe, expect, it } from "bun:test";
import { applyTestEnv } from "@/config/testEnv";

applyTestEnv();
const { safeRequestId } = await import("./createApp");

describe("safeRequestId", () => {
  it("keeps ids set by nginx or another service", () => {
    expect(safeRequestId("7f3c2a9e8b1d4c6f")).toBe("7f3c2a9e8b1d4c6f");
    expect(safeRequestId("req_123-abc")).toBe("req_123-abc");
  });

  it("replaces values that could forge log lines or flood the logs", () => {
    expect(safeRequestId("abc\ninjected log line")).not.toContain("\n");
    expect(safeRequestId("x".repeat(500)).length).toBeLessThanOrEqual(64);
    expect(safeRequestId(undefined)).toMatch(/^[0-9a-f-]{36}$/);
  });
});
