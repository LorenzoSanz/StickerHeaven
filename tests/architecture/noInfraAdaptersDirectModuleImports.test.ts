// PORQUÉ: Prueba que ningún módulo importe directamente un adaptador de infraestructura ni otro módulo.
// INTEGRIDAD: Verifica que solo se importen los módulos públicos.
// ESTRUCTURA: Suite de tests - Unit Pruebas.

import { test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

// PROPÓSITO: Recorre recursivamente un directorio y devuelve una lista de todos los archivos TypeScript.
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

// PROPÓSITO: Extrae todos los especificadores de importación de una cadena de código TypeScript.
function extractImportSpecifiers(source: string): string[] {
  const out: string[] = [];

// PROPÓSITO: Extrae todos los especificadores de importación de un archivo TypeScript.
  const fromRe = /\bfrom\s+["']([^"']+)["']/g;
  for (;;) {
    const m = fromRe.exec(source);
    if (!m) break;
    out.push(m[1]);
  }

// PROPÓSITO: Extrae todos los especificadores de importación con efectos secundarios.
  const sideEffectRe = /\bimport\s+["']([^"']+)["']/g;
  for (;;) {
    const m = sideEffectRe.exec(source);
    if (!m) break;
    out.push(m[1]);
  }

  return out;
}

// PROPÓSITO: Prueba que ningún módulo importe directamente un adaptador de infraestructura ni otro módulo.
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
