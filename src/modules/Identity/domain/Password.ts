/**
 * POR QUÉ: Encapsula reglas de validación de contraseña (longitud, complejidad).
 * INTEGRIDAD: Evita "Primitive Obsession". Garantiza que Password siempre sea válida.
 * ESTRUCTURA: Capa Domain - independiente del algoritmo de hash o persistencia.
 */

import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
class InvalidPasswordError extends DomainError {
  constructor(reason: string) {
    super(`Contraseña inválida: ${reason}`);
  }
}

interface PasswordProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class Password extends ValueObject<PasswordProps> {
  public static readonly MIN_LENGTH = 6;

  private constructor(props: PasswordProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(password: string): Result<Password, DomainError> {
    if (!password) {
      return Result.fail(new InvalidPasswordError("La contraseña es obligatoria"));
    }

    if (password.length < this.MIN_LENGTH) {
      return Result.fail(
        new InvalidPasswordError(
          `La contraseña debe tener al menos ${this.MIN_LENGTH} caracteres`
        )
      );
    }

    return Result.ok(new Password({ value: password }));
  }
}
