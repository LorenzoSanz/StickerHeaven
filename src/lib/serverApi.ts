
if (typeof window !== "undefined") {
  throw new Error("src/lib/serverApi.ts is server-only");
}

import { cookies } from "next/headers";
import { env } from "@/config/env";
import { getApiUrlForRewrites } from "@/config/nextConfigEnv";
import { readErrorMessage } from "@/lib/readErrorMessage";
import { toCookieHeader } from "@/lib/toCookieHeader";

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
