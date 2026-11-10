// POR QUÉ: Error genérico para representar errores inesperados en el dominio.
// INTEGRIDAD: Asegura que se capturen y se manejen errores inesperados de manera consistente.

import { DomainError } from "./DomainError";

export class UnexpectedError extends DomainError {
  constructor(message: string = "Error interno del servidor") {
    super(message);
    this.name = "UnexpectedError";
  }
}

