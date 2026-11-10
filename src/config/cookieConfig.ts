import { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/config/sessionCookie";

const isProd = process.env.NODE_ENV === "production";

export const cookieConfig = {
  session: {
    name: SESSION_COOKIE_NAME,
    // Evitamos duplicar opciones de la cookie de sesión en dos ficheros distintos.
    // Reutilizamos la misma fuente de verdad que usan Server Actions y controllers.
    ...sessionCookieOptions,
  },
  cart: {
    name: "anonymousCartId",
    path: "/",
    httpOnly: true,
    secure: isProd,
    sameSite: "Lax" as const,
    maxAge: 60 * 60 * 24 * 30,
  },
} as const;
