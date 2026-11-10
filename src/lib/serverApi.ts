// POR QUÉ: Se unifica el acceso SSR al backend para que Next Server Components/Actions compartan cookies y manejo de errores.
// QUÉ: Expone helpers server-only para construir requests hacia la API (vía rewrites), propagando cookies y normalizando fallos HTTP.
// LÍMITES: No conoce casos de uso; solo traduce “llamar a la API” con contratos consistentes para la UI.
// SEGURIDAD: Por defecto incluye cookies y fuerza no-store cuando hay sesión, evitando cachear respuestas personalizadas.

if (typeof window !== "undefined") {
  throw new Error("src/lib/serverApi.ts is server-only");
}

import { cookies } from "next/headers";
import { env } from "@/config/env";
import { getApiUrlForRewrites } from "@/config/nextConfigEnv";
import { readErrorMessage } from "@/lib/readErrorMessage";
import { toCookieHeader } from "@/lib/toCookieHeader";

/**
 * POR QUÉ: Normalizamos fallos HTTP para que la UI pueda diferenciar “error de red/parseo” de “respuesta con status 4xx/5xx”.
 * QUÉ: Error tipado con `status` para propagar el código HTTP sin acoplarse a la librería de fetch.
 */
export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export type ServerApiRequestInit = RequestInit & {
  json?: unknown;
  includeCookies?: boolean;
  next?: { revalidate?: number; tags?: string[] };
};

/**
 * POR QUÉ: La UI SSR necesita una forma segura y consistente de llamar a la API y propagar errores HTTP con un tipo explícito.
 * QUÉ: Hace una request a la API (vía serverApiRequest) y devuelve JSON tipado; si el status no es ok, lanza HttpError.
 * CONTRATO: En 204 retorna null (tipado como T) para endpoints sin body.
 */
export async function serverApiFetch<T>(
  path: string,
  init?: ServerApiRequestInit
): Promise<T> {
  const res = await serverApiRequest(path, init);

  if (!res.ok) {
    throw new HttpError(await readErrorMessage(res), res.status);
  }

  if (res.status === 204) {
    return null as T;
  }

  return (await res.json()) as T;
}

/**
 * POR QUÉ: Centralizamos la construcción de headers/body/cookies para evitar inconsistencias entre Server Actions y Server Components.
 * QUÉ: Construye la URL hacia la API (según rewrites), añade cookies SSR opcionalmente y envía JSON cuando `init.json` está definido.
 * NOTAS: Cuando se incluyen cookies, forzamos `cache=no-store` para evitar cachear respuestas personalizadas por sesión.
 */
export async function serverApiRequest(path: string, init?: ServerApiRequestInit): Promise<Response> {
  const apiBaseUrl = getApiUrlForRewrites();
  const url = new URL(path, apiBaseUrl);

  const { json, includeCookies = true, ...requestInit } = init ?? {};

  const method = (requestInit.method ?? "GET").toUpperCase();
  const isUnsafeMethod = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

  const headers = new Headers(requestInit.headers);
  if (includeCookies) {
    const cookieStore = await cookies();
    const cookieHeaderValue = toCookieHeader(cookieStore.getAll());
    if (cookieHeaderValue) headers.set("cookie", cookieHeaderValue);
  }

  if (isUnsafeMethod && headers.has("cookie")) {
    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
    if (!headers.has("origin")) headers.set("origin", appUrl);
    if (!headers.has("referer")) headers.set("referer", `${appUrl}/`);
  }

  let body = requestInit.body;
  if (typeof json !== "undefined") {
    headers.set("content-type", "application/json");
    body = JSON.stringify(json);
  }

  return fetch(url, {
    ...requestInit,
    headers,
    body,
    cache: requestInit.cache ?? (includeCookies ? "no-store" : undefined),
  });
}
