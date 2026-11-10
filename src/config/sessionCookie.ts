export const SESSION_COOKIE_NAME = "sessionId";
const SESSION_DURATION_SECONDS = 3600;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
export interface CookieAdapter {
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete?(name: string, options: Record<string, unknown>): void;
}
// Especifica cómo se establece la cookie de sesión.
export function setSessionCookie(adapter: CookieAdapter, sessionId: string) {
  adapter.set(SESSION_COOKIE_NAME, sessionId, sessionCookieOptions);
}
// Especifica cómo se elimina la cookie de sesión.
export function deleteSessionCookie(adapter: CookieAdapter) {
  if (adapter.delete) {
    adapter.delete(SESSION_COOKIE_NAME, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
  } else {
    adapter.set(SESSION_COOKIE_NAME, "", {
      ...sessionCookieOptions,
      maxAge: 0,
    });
  }
}
