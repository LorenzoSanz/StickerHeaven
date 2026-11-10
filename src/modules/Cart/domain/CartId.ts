/**
 * POR QUÉ: Unique identifier for a Cart.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface CartIdProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class CartId extends ValueObject<CartIdProps> {
  private constructor(props: CartIdProps) {
    super(props);
  }

  public static create(value: string): Result<CartId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Cart ID cannot be empty"));
    }
    return Result.ok(new CartId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
