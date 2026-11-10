/**
 * POR QUÉ: Representa la identidad de un User.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

export interface UserIdProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class UserId extends ValueObject<UserIdProps> {
  private constructor(props: UserIdProps) {
    super(props);
  }

  public static create(value: string): Result<UserId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("User ID cannot be empty"));
    }
    if (!validateUuid(value)) {
      return Result.fail(new DomainError("Invalid User ID format (UUID required)"));
    }
    return Result.ok(new UserId({ value }));
  }

  public static random(): UserId {
    return new UserId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
