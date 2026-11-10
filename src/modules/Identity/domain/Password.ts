
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

class InvalidPasswordError extends DomainError {
  constructor(reason: string) {
    super(`Contraseña inválida: ${reason}`);
  }
}

interface PasswordProps {
  value: string;
}

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
