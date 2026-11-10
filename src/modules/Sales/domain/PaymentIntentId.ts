/**
 * POR QUÉ: Representa un concepto del dominio.
 * INTEGRIDAD: Encapsula el ID para evitar primitive obsession y asegurar type safety.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface PaymentIntentIdProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class PaymentIntentId extends ValueObject<PaymentIntentIdProps> {
  private constructor(props: PaymentIntentIdProps) {
    super(props);
  }

  public static create(value: string): Result<PaymentIntentId, DomainError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new DomainError("PaymentIntentId cannot be empty"));
    }
    return Result.ok(new PaymentIntentId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
