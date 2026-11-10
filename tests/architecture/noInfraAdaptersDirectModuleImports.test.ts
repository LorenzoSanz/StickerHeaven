
import { test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(abs, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!abs.endsWith(".ts") && !abs.endsWith(".tsx")) continue;
    out.push(abs);
  }
  return out;
}

function extractImportSpecifiers(source: string): string[] {
  const out: string[] = [];

  const fromRe = /\bfrom\s+["']([^"']+)["']/g;
  for (;;) {
    const m = fromRe.exec(source);
    if (!m) break;
    out.push(m[1]);
  }

  const sideEffectRe = /\bimport\s+["']([^"']+)["']/g;
  for (;;) {
    const m = sideEffectRe.exec(source);
    if (!m) break;
    out.push(m[1]);
  }

  return out;
}

test("modules do not import infrastructure adapters directly", () => {
  const repoRoot = process.cwd();
  const modulesRoot = path.join(repoRoot, "src", "modules");
  const files = walkFiles(modulesRoot);

  const violations: Array<{ file: string; specifier: string }> = [];

  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const imports = extractImportSpecifiers(content);
    for (const specifier of imports) {
      if (!specifier.startsWith("@/infrastructure/adapters/")) continue;
      violations.push({ file, specifier });
    }
  }

  if (violations.length) {
    const message =
      "Modules must not depend on infrastructure adapters (dependency direction violation):\n" +
      violations
        .map((v) => `- ${path.relative(repoRoot, v.file)} imports ${v.specifier}`)
        .sort()
        .join("\n");
    throw new Error(message);
  }
});
