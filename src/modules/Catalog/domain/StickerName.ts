import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface StickerNameProps {
  value: string;
}

export class StickerName extends ValueObject<StickerNameProps> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 50;

  private constructor(props: StickerNameProps) {
    super(props);
  }

  public static create(name: string): Result<StickerName, DomainError> {
    if (!name || name.trim().length === 0) {
      return Result.fail<StickerName, DomainError>(new DomainError("Sticker name cannot be empty"));
    }
    if (name.length < StickerName.MIN_LENGTH || name.length > StickerName.MAX_LENGTH) {
      return Result.fail<StickerName, DomainError>(new DomainError(`Sticker name must be between ${StickerName.MIN_LENGTH} and ${StickerName.MAX_LENGTH} characters`));
    }
    return Result.ok<StickerName, DomainError>(new StickerName({ value: name }));
  }

  get value(): string {
    return this.props.value;
  }
}
