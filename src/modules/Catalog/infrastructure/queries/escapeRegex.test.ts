import { describe, expect, it } from "bun:test";
import { escapeRegex } from "./escapeRegex";

describe("escapeRegex", () => {
  it("turns regex metacharacters into literals", () => {
    expect(escapeRegex("(a+)+$")).toBe("\\(a\\+\\)\\+\\$");
    expect(new RegExp(escapeRegex("c++ [beta]")).test("c++ [beta]")).toBe(true);
    expect(new RegExp(escapeRegex("c++ [beta]")).test("ccc beta")).toBe(false);
  });

  it("leaves plain text unchanged", () => {
    expect(escapeRegex("anime cute")).toBe("anime cute");
  });
});
