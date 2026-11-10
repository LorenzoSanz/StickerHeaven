import { describe, expect, it } from "bun:test";
import { forwardClientIp } from "./forwardClientIp";

describe("forwardClientIp", () => {
  it("passes the visitor address set by nginx on to the API", () => {
    const outgoing = new Headers();
    forwardClientIp(new Headers({ "x-real-ip": "203.0.113.9" }), outgoing);
    expect(outgoing.get("x-real-ip")).toBe("203.0.113.9");
  });

  it("adds nothing when the web is not behind nginx", () => {
    const outgoing = new Headers();
    forwardClientIp(new Headers(), outgoing);
    expect(outgoing.has("x-real-ip")).toBe(false);
  });
});
