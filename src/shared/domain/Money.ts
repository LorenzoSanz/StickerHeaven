/**
 * POR QUÉ: Objeto de Valor para Money/Currency.
 * INTEGRIDAD: Garantiza que el importe sea positivo (o cero) y tenga divisa.
 * ESTRUCTURA: Núcleo compartido.
 */
import { ValueObject } from "./ValueObject";
import { Result } from "./Result";
import { DomainError } from "./DomainError";

export interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * POR QUÉ: Crea una instancia de Money.
   * INTEGRIDAD: Asegura que se valide correctamente el importe y la divisa.
   */
  public static create(amount: number, currency: string = "EUR"): Result<Money, InvalidMoneyError> {
    if (amount < 0) {
      return Result.fail<Money, InvalidMoneyError>(new InvalidMoneyError("Money amount cannot be negative"));
    }
    if (!currency || currency.length !== 3) {
      return Result.fail<Money, InvalidMoneyError>(new InvalidMoneyError("Invalid currency code"));
    }
    return Result.ok<Money, InvalidMoneyError>(new Money({ amount, currency }));
  }

  /**
   * POR QUÉ: Suma dos objetos de valor Money.
   * INTEGRIDAD: Asegura que se sumen correctamente los importes de dinero con la misma divisa.
   */
  public add(other: Money): Result<Money, InvalidMoneyError> {
    if (other.currency !== this.currency) {
      return Result.fail(new InvalidMoneyError("Cannot add money with different currencies"));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  /**
   * POR QUÉ: Multiplica un objeto de valor Money por un factor.
   * INTEGRIDAD: Asegura que se multiplique correctamente el importe de dinero por el factor.
   */
  public multiply(factor: number): Result<Money, InvalidMoneyError> {
    return Money.create(this.amount * factor, this.currency);
  }

  /**
   * POR QUÉ: Devuelve el importe de dinero.
   * INTEGRIDAD: Asegura que se acceda correctamente al importe de dinero.
   */
  get amount(): number {
    return this.props.amount;
  }

  /**
   * POR QUÉ: Devuelve la divisa de dinero.
   * INTEGRIDAD: Asegura que se acceda correctamente a la divisa de dinero.
   */
  get currency(): string {
    return this.props.currency;
  }
}
