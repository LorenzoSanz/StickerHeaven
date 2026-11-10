import { DomainError } from "./DomainError";

/**
 * POR QUÉ: Error lanzado cuando se detecta una condición de concurrencia.
 * INTEGRIDAD: Asegura que se manejen correctamente las operaciones concurrentes.
 * ESTRUCTURA: Núcleo compartido - Error domain-specific.
 */
export class ConcurrencyError extends DomainError {
  constructor(entity: string, id: string) {
    super(`Concurrency Error: ${entity} ${id} was modified by another transaction.`);
    this.name = "ConcurrencyError";
  }
}

