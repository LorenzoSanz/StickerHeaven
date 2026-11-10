// PROPÓSITO: Value Object para representar un correo electrónico de suscriptor.
// INTEGRIDAD: Garantiza que solo se almacenen correos electrónicos válidos.
// ESTRUCTURA: Capa Domain.
import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export class InvalidSubscriberEmailError extends DomainError {
  constructor(email: string) {
    super(`The email <${email}> is invalid.`);
  }
}

type SubscriberEmailProps = {
  value: string;
};

export class SubscriberEmail extends ValueObject<SubscriberEmailProps> {
  private constructor(props: SubscriberEmailProps) {
    super(props);
  }

  public static create(email: string): Result<SubscriberEmail, InvalidSubscriberEmailError> {
    if (!this.isValid(email)) {
      return Result.fail(new InvalidSubscriberEmailError(email));
    }
    return Result.ok(new SubscriberEmail({ value: email }));
  }

  private static isValid(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  get value(): string {
    return this.props.value;
  }
}

