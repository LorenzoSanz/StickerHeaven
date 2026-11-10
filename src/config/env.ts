/**
 * POR QUÉ: Forzamos acceso tipado y validado a variables de entorno para que fallos de configuración fallen al arrancar, no en runtime.
 * QUÉ: Parse/valida process.env con Zod (envSchemas) y expone `env` como proxy lazy con caché fuera de test.
 * LÍMITES: Server-only; la UI solo debe leer variables públicas desde publicEnv/next config.
 * OBSERVABILIDAD: Incluye detalle de fieldErrors en el error de arranque para diagnóstico rápido.
 */
import { envSchema } from "@/config/envSchemas";

if (typeof window !== "undefined") {
  throw new Error("src/config/env.ts is server-only");
}
//
/**
 * Tipo de la configuración de entorno, derivado del esquema Zod.
 */
type Env = typeof envSchema._output;
//
/**
 * Parse/valida process.env con Zod (envSchemas) y expone `env` como proxy lazy con caché fuera de test.
 * Lanza error si la configuración es inválida.
 */
function parseEnv(): Env {
  const parsed = envSchema.safeParse({
    ...process.env,
    REDIS_URL: process.env.REDIS_URL?.trim() ? process.env.REDIS_URL : undefined,
  });

  // POR QUÉ: Lanzar error al arrancar si la configuración es inválida.
  // QUÉ: Incluir detalles de los campos inválidos para facilitar la corrección.
  if (!parsed.success) {
    const details = JSON.stringify(parsed.error.flatten().fieldErrors);
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}

//
/**
 * Proxy lazy para acceder a la configuración de entorno.
 * En test, parsea y devuelve la configuración cada vez.
 * En producción, parsea y cachea la configuración la primera vez.
 */
let cachedEnv: Env | null = null;

// POR QUÉ: Cachear la configuración en producción para evitar parsear múltiples veces.
function getEnv(): Env {
  if ((process.env.NODE_ENV ?? "development") === "test" || !!process.env.BUN_TEST) {
    return parseEnv();
  }

  if (!cachedEnv) cachedEnv = parseEnv();
  return cachedEnv;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    return getEnv()[prop as keyof Env];
  },
});
