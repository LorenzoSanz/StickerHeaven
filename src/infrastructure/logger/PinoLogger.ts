
import pino from "pino";
import { ILogger } from "@/shared/domain/ILogger";

export interface LoggerConfig {
  env: string;
}

// Exporta la clase de Pino para usarlo en otras partes de la aplicación
export class PinoLogger implements ILogger {
  private logger: pino.Logger;

  constructor(config: LoggerConfig) {
    this.logger = pino({
      level: config.env === "production" ? "info" : "debug",
      redact: {
        paths: [
          "email",
          "*.email",
          "password",
          "*.password",
          "sessionId",
          "*.sessionId",
          "authorization",
          "headers.authorization",
          "cookie",
          "headers.cookie",
          "args[*].email",
          "args[*].password",
          "args[*].sessionId",
          "args[*].authorization",
          "args[*].cookie",
        ],
        censor: "[REDACTED]",
      },
      transport:
        config.env === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            }
          : undefined,
    });
  }

  private log(level: "debug" | "info" | "warn" | "error", message: string, args: unknown[]): void {
    if (args.length === 0) {
      this.logger[level](message);
      return;
    }

    if (args.length === 1) {
      const only = args[0];
      if (only instanceof Error) {
        this.logger[level]({ err: only }, message);
        return;
      }
      if (only && typeof only === "object") {
        this.logger[level](only as Record<string, unknown>, message);
        return;
      }
    }

    this.logger[level]({ args }, message);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log("debug", message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log("info", message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log("warn", message, args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log("error", message, args);
  }
}
