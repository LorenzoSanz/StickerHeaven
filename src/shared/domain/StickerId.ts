import { ValueObject } from "./ValueObject";
import { Result } from "./Result";
import { DomainError } from "./DomainError";
import { v4 as uuidv4, validate as validateUuid } from "uuid";

export interface StickerIdProps {
  value: string;
}

export class StickerId extends ValueObject<StickerIdProps> {
  private constructor(props: StickerIdProps) {
    super(props);
  }

  public static create(value: string): Result<StickerId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Sticker ID cannot be empty"));
    }
    if (!validateUuid(value)) {
      return Result.fail(new DomainError("Invalid Sticker ID format (UUID required)"));
    }
    return Result.ok(new StickerId({ value }));
  }
  
  public static random(): StickerId {
    return new StickerId({ value: uuidv4() });
  }

  get value(): string {
    return this.props.value;
  }
}
