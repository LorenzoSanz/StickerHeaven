
import { DomainError } from "./DomainError";

export class UnexpectedError extends DomainError {
  constructor(message: string = "Error interno del servidor") {
    super(message);
    this.name = "UnexpectedError";
  }
}

