import { describe, expect, test } from "bun:test";
import { toCookieHeader } from "./toCookieHeader";

describe("toCookieHeader", () => {
  test("joins cookies in a single header value", () => {
    expect(
      toCookieHeader([
        { name: "a", value: "1" },
        { name: "b", value: "2" },
      ])
    ).toBe("a=1; b=2");
  });

  test("returns empty string when there are no cookies", () => {
    expect(toCookieHeader([])).toBe("");
  });
});

