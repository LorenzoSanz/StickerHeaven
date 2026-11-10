/**
 * POR QUÉ: Representa una cantidad entera positiva (p.ej., para items del carrito, items del pedido).
 * INTEGRIDAD: Asegura quantity > 0 y valores enteros.
 * ESTRUCTURA: Núcleo compartido.
 */
import { ValueObject } from "./ValueObject";
import { Result } from "./Result";
import { DomainError } from "./DomainError";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class InvalidQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Quantity must be a positive integer. Got: ${quantity}`);
  }
}

interface QuantityProps {
  value: number;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class Quantity extends ValueObject<QuantityProps> {
  private constructor(props: QuantityProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }
  /**
   * POR QUÉ: Crea una instancia de Quantity.
   * INTEGRIDAD: Asegura que se valide correctamente el valor de cantidad.
   */
  public static create(value: number): Result<Quantity, InvalidQuantityError> {
    if (!Number.isInteger(value) || value < 1) {
      return Result.fail(new InvalidQuantityError(value));
    }
    return Result.ok(new Quantity({ value }));
  }

  /**
   * POR QUÉ: Suma dos objetos de valor Quantity.
   * INTEGRIDAD: Asegura que se sumen correctamente los valores de cantidad.
   */
  public add(other: Quantity): Result<Quantity, InvalidQuantityError> {
    return Quantity.create(this.value + other.value);
  }

  /**
   * POR QUÉ: Resta dos objetos de valor Quantity.
   * INTEGRIDAD: Asegura que se resten correctamente los valores de cantidad.
   */
  public subtract(other: Quantity): Result<Quantity, InvalidQuantityError> {
    return Quantity.create(this.value - other.value);
  }
}
