
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`El email <${email}> es inválido.`);
  }
}

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  /**
   * Factory method to create an Email.
   * Enforces validation before creation.
   */
  public static create(email: string): Result<Email, InvalidEmailError> {
    if (!this.isValid(email)) {
      return Result.fail(new InvalidEmailError(email));
    }
    return Result.ok(new Email({ value: email }));
  }

  private static isValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  get value(): string {
    return this.props.value;
  }
}
