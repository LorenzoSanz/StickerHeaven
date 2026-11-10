/**
 * POR QUÉ: Las Server Actions hacen fetch en el servidor; los Set-Cookie del backend no llegan al navegador automáticamente.
 * QUÉ: Extrae cookies desde headers Set-Cookie de una Response y las escribe en cookies() de Next.
 */
if (typeof window !== "undefined") {
  throw new Error("src/lib/propagateSetCookie.ts is server-only");
}

import type { cookies } from "next/headers";

export type NextCookieStore = Awaited<ReturnType<typeof cookies>>;

// PROPÓSITO: Extrae valores de Set-Cookie de una Response.
function getSetCookieValues(res: Response): string[] {
  const headers = res.headers as unknown as { getSetCookie?: () => string[] };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

// PROPÓSITO: Extrae el valor de una cookie específica de una cadena Set-Cookie.
function extractCookieValue(setCookie: string, name: string): string | null {
  const prefix = `${name}=`;
  const start = setCookie.indexOf(prefix);
  if (start === -1) return null;
  const raw = setCookie.slice(start + prefix.length);
  const end = raw.indexOf(";");
  const value = (end === -1 ? raw : raw.slice(0, end)).trim();
  return value || null;
}

// PROPÓSITO: Normaliza el valor sameSite a uno de los valores permitidos por Next.js.
function normalizeSameSite(value: unknown): "strict" | "lax" | "none" | undefined {
  if (value === "Strict" || value === "strict") return "strict";
  if (value === "Lax" || value === "lax") return "lax";
  if (value === "None" || value === "none") return "none";
  return undefined;
}

// PROPÓSITO: Propaga cookies desde Set-Cookie de una Response a cookies() de Next.
export function propagateCookieFromResponse({
  res,
  cookieStore,
  cookieName,
  options,
}: {
  res: Response;
  cookieStore: NextCookieStore;
  cookieName: string;
  options: {
    maxAge?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: unknown;
  };
}): boolean {
  const cookiesToApply = getSetCookieValues(res);
  for (const setCookie of cookiesToApply) {
    const value = extractCookieValue(setCookie, cookieName);
    if (!value) continue;
    cookieStore.set(cookieName, value, {
      maxAge: options.maxAge,
      path: options.path ?? "/",
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: normalizeSameSite(options.sameSite),
    });
    return true;
  }
  return false;
}

