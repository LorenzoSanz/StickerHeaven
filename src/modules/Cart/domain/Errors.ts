/**
 * POR QUÉ: Define errores específicos del dominio para el módulo Cart.
 * INTEGRIDAD: Proporciona semantic error types for business rule violations.
 * ESTRUCTURA: Capa Domain - Errors.
 */
import { DomainError } from "../../../shared/domain/DomainError";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class InvalidCartItemQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Invalid quantity: ${quantity}`);
    this.name = "InvalidCartItemQuantityError";
  }
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class CartItemNotFoundError extends DomainError {
  constructor(stickerId: string) {
    super(`Cart item not found: ${stickerId}`);
    this.name = "CartItemNotFoundError";
  }
}
