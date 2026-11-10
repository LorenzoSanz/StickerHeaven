/**
 * POR QUÉ: Aislamos la conexión a Mongo para que el lifecycle del proceso (node.ts) no mezcle detalles de Mongoose.
 * QUÉ: Expone helpers idempotentes para conectar y cerrar la conexión global de Mongoose.
 * LÍMITES: No define modelos ni repositorios; solo gestiona el recurso de conexión.
 * OBSERVABILIDAD: Emite logs de conexión/desconexión para diagnóstico de arranque y shutdown.
 */
import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "@/config/env";
import type { ILogger } from "@/shared/domain/ILogger";

/**
 * POR QUÉ: Bun/Node en ciertas redes (ej. España/Movistar) falla resolviendo hosts de MongoDB Atlas.
 * QUÉ: Aplica servidores DNS externos (ej. 1.1.1.1) si se definen en la env var DNS_SERVERS.
 */
function applyDnsBypass(logger: ILogger): void {
  const raw = process.env.DNS_SERVERS?.trim();
  if (!raw) return;

  const dnsServers = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    try {
      dns.setServers(dnsServers);
      logger.info("DNS_SERVERS bypass activado", { dnsServers });
    } catch (err) {
      logger.warn("No se pudieron configurar los DNS_SERVERS", err);
    }
  }
}

/**
 * POR QUÉ: Ayuda al desarrollador a diagnosticar fallos de red comunes.
 * QUÉ: Identifica si un error de conexión es probablemente debido a DNS.
 */
function isDnsError(err: unknown): boolean {
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  return (
    text.includes("ENOTFOUND") ||
    text.includes("EAI_AGAIN") ||
    text.includes("querySrv") ||
    text.includes("ENODATA") ||
    text.includes("ETIMEOUT")
  );
}

/**
 * POR QUÉ: La API necesita una conexión antes de instanciar repositorios/persistencia.
 * QUÉ: Conecta Mongoose usando DATABASE_URL validada por config/env.
 */
export async function connectMongo(logger: ILogger): Promise<void> {
  applyDnsBypass(logger);

  try {
    await mongoose.connect(env.DATABASE_URL);
    logger.info("Connected to MongoDB");
  } catch (err) {
    if (isDnsError(err)) {
      logger.error(
        "Fallo de conexión a Mongo (DNS). Si usas Atlas, intenta añadir DNS_SERVERS=1.1.1.1,8.8.8.8 al .env.local",
        err
      );
    }
    throw err;
  }
}

/**
 * POR QUÉ: Cerramos recursos en SIGINT/SIGTERM para evitar conexiones colgantes en entornos gestionados.
 * QUÉ: Cierra la conexión global de Mongoose.
 */
export async function disconnectMongo(logger: ILogger): Promise<void> {
  await mongoose.connection.close();
  logger.info("Disconnected from MongoDB");
}
