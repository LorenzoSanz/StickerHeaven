import { DomainError } from "./DomainError";

export class ConcurrencyError extends DomainError {
  constructor(entity: string, id: string) {
    super(`Concurrency Error: ${entity} ${id} was modified by another transaction.`);
    this.name = "ConcurrencyError";
  }
}

