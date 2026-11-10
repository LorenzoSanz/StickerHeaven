import { ValueObject } from "./ValueObject";
import { Result } from "./Result";
import { DomainError } from "./DomainError";

export interface MoneyProps {
  amount: number;
  currency: string;
}

export class InvalidMoneyError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: string = "EUR"): Result<Money, InvalidMoneyError> {
    if (amount < 0) {
      return Result.fail<Money, InvalidMoneyError>(new InvalidMoneyError("Money amount cannot be negative"));
    }
    if (!currency || currency.length !== 3) {
      return Result.fail<Money, InvalidMoneyError>(new InvalidMoneyError("Invalid currency code"));
    }
    return Result.ok<Money, InvalidMoneyError>(new Money({ amount, currency }));
  }

  public add(other: Money): Result<Money, InvalidMoneyError> {
    if (other.currency !== this.currency) {
      return Result.fail(new InvalidMoneyError("Cannot add money with different currencies"));
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  public multiply(factor: number): Result<Money, InvalidMoneyError> {
    return Money.create(this.amount * factor, this.currency);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }
}
