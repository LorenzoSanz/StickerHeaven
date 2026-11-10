import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "@/config/env";
import type { ILogger } from "@/shared/domain/ILogger";

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

export async function disconnectMongo(logger: ILogger): Promise<void> {
  await mongoose.connection.close();
  logger.info("Disconnected from MongoDB");
}
