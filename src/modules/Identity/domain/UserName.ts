import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export class InvalidUserNameError extends DomainError {
  constructor(reason: string) {
    super(`Nombre de usuario inválido: ${reason}`);
  }
}

interface UserNameProps {
  value: string;
}

export class UserName extends ValueObject<UserNameProps> {
  public static readonly MIN_LENGTH = 2;
  public static readonly MAX_LENGTH = 50;

  private constructor(props: UserNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(name: string): Result<UserName, InvalidUserNameError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new InvalidUserNameError("El nombre es obligatorio"));
    }

    const trimmedName = name.trim();

    if (trimmedName.length < this.MIN_LENGTH) {
      return Result.fail(
        new InvalidUserNameError(
          `El nombre debe tener al menos ${this.MIN_LENGTH} caracteres`
        )
      );
    }

    if (trimmedName.length > this.MAX_LENGTH) {
      return Result.fail(
        new InvalidUserNameError(
          `El nombre debe tener como máximo ${this.MAX_LENGTH} caracteres`
        )
      );
    }

    return Result.ok(new UserName({ value: trimmedName }));
  }
}
