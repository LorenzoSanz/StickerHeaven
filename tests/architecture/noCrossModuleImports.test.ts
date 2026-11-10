// PORQUÉ: Prueba que ningún módulo importe internamente otro módulo.
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

// PROPÓSITO: Extrae el nombre del módulo a partir de una ruta de archivo.  
function moduleNameFromFilePath(filePath: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const marker = "/src/modules/";
  const idx = normalized.indexOf(marker);
  if (idx === -1) return null;
  const rest = normalized.slice(idx + marker.length);
  const [moduleName] = rest.split("/");
  return moduleName || null;
}

// PROPÓSITO: Extrae el nombre del módulo a partir de una ruta de importación.
function moduleNameFromImportPath(specifier: string): string | null {
  if (!specifier.startsWith("@/modules/")) return null;
  const rest = specifier.slice("@/modules/".length);
  const [moduleName] = rest.split("/");
  return moduleName || null;
}

// PROPÓSITO: Verifica si una importación es permitida entre módulos.
function isAllowedCrossModuleImport(specifier: string, targetModule: string): boolean {
  return (
    specifier === `@/modules/${targetModule}/public` ||
    specifier === `@/modules/${targetModule}/public.ts` ||
    specifier.startsWith(`@/modules/${targetModule}/public/`)
  );
}

// PROPÓSITO: Prueba que ningún módulo importe internamente otro módulo.
test("modules do not import other modules internals (only public API)", () => {
  const repoRoot = process.cwd();
  const modulesRoot = path.join(repoRoot, "src", "modules");
  const files = walkFiles(modulesRoot);

  const violations: Array<{ file: string; specifier: string }> = [];

  for (const file of files) {
    const fromModule = moduleNameFromFilePath(file);
    if (!fromModule) continue;

    const content = fs.readFileSync(file, "utf8");
    const imports = extractImportSpecifiers(content);

    for (const specifier of imports) {
      const targetModule = moduleNameFromImportPath(specifier);
      if (!targetModule) continue;
      if (targetModule === fromModule) continue;
      if (isAllowedCrossModuleImport(specifier, targetModule)) continue;

      violations.push({ file, specifier });
    }
  }

  if (violations.length) {
    const message =
      "Cross-module imports must go through each module public API:\n" +
      violations
        .map((v) => `- ${path.relative(repoRoot, v.file)} imports ${v.specifier}`)
        .sort()
        .join("\n");
    throw new Error(message);
  }
});
