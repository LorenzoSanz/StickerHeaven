// POR QUÉ: Configuración de la cookie de sesión para Next.js.
// QUÉ: Define el nombre, duración y opciones de seguridad para la cookie de sesión.
// LÍMITES: Hay que asegurarse de que el valor de secure coincida con el entorno (production).
export const SESSION_COOKIE_NAME = "sessionId";
const SESSION_DURATION_SECONDS = 3600;

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
// POR QUÉ: Adaptador para manejar cookies en Next.js.
// QUÉ: Define métodos para establecer y eliminar cookies.
// LÍMITES: El adaptador debe ser compatible con el entorno de Next.js.
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
