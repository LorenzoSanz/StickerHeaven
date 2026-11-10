/**
 * POR QUÉ: Errores específicos del dominio para el módulo Catalog.
 * INTEGRIDAD: Define explicit error types for better error handling.
 * ESTRUCTURA: Capa Domain - Errors.
 */
import { DomainError } from "../../../shared/domain/DomainError";

export class StickerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`No se encontró el sticker con id ${id}`);
  }
}

export class StickerOwnershipError extends DomainError {
  constructor() {
    super("No estás autorizado para realizar esta acción sobre este sticker");
  }
}
