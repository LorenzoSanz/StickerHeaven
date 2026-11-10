import { describe, it, expect } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("stripe env separation", () => {
  it("src/lib/stripe.ts must not import server env", async () => {
    const stripePath = path.join(__dirname, "stripe.ts");
    const source = await readFile(stripePath, "utf8");

    expect(source).not.toMatch(/from\s+["']@\/config\/env["']/);
    expect(source).not.toMatch(/from\s+["']\.\.\/config\/env["']/);
    expect(source).toMatch(/from\s+["']@\/config\/publicEnv["']/);
  });
});
