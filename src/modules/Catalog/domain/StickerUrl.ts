import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface StickerUrlProps {
  value: string;
}

// Esto es un Objeto de Valor para representar la URL de una imagen de un sticker.
export class StickerUrl extends ValueObject<StickerUrlProps> {
  private constructor(props: StickerUrlProps) {
    super(props);
  }

  public static create(url: string): Result<StickerUrl, DomainError> {
    if (!url || url.trim().length === 0) {
      return Result.fail<StickerUrl, DomainError>(new DomainError("Sticker URL cannot be empty"));
    }
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      return Result.fail<StickerUrl, DomainError>(new DomainError("Invalid Sticker URL format"));
    }
    
    return Result.ok<StickerUrl, DomainError>(new StickerUrl({ value: url }));
  }

  get value(): string {
    return this.props.value;
  }
}
