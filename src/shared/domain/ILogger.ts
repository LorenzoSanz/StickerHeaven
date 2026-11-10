/**
 * POR QUÉ: Desacopla las capas Domain y Application de la implementación concreta de logging (Pino ahora jejej).
 * INTEGRIDAD: Define el contrato estándar de logging usado en todo el sistema.
 * ESTRUCTURA: Núcleo compartido - Cross-cutting concern interface.
 */

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
