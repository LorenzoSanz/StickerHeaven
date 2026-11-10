import { ILogger } from "@/shared/domain/ILogger";

/* PROPÓSITO: Implementación “vacía” (no-op) del contrato `ILogger`: sus métodos (`debug/info/warn/error`) no devuelven nada.
/ El sistema programa contra `ILogger` y normalmente inyecta el logger real (`PinoLogger`) desde el composition root.
/ Fallback del `DomainEventPublisher` si nadie le inyecta logger.
/ Logger “dummy” en tests** para no ensuciar la salida ni depender de infraestructura.
*/

export class NullLogger implements ILogger {
  debug(message: string, ...args: unknown[]): void {}
  info(message: string, ...args: unknown[]): void {}
  warn(message: string, ...args: unknown[]): void {}
  error(message: string, ...args: unknown[]): void {}
}
