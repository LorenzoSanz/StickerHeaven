/**
 * POR QUÉ: Representa un concepto del dominio.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface AnonymousCartIdProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class AnonymousCartId extends ValueObject<AnonymousCartIdProps> {
  private constructor(props: AnonymousCartIdProps) {
    super(props);
  }

  public static create(value: string): Result<AnonymousCartId, DomainError> {
    if (!value || value.trim().length === 0) {
      return Result.fail(new DomainError("Anonymous Cart ID cannot be empty"));
    }
    return Result.ok(new AnonymousCartId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
