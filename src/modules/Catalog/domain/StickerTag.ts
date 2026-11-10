import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

// Error cuando el tag es inválido.
export class InvalidTagError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export interface StickerTagProps {
  value: string;
}

// Objeto de Valor para representar una etiqueta (tag) de un sticker.
export class StickerTag extends ValueObject<StickerTagProps> {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 20;
  private static readonly VALID_REGEX = /^[a-z0-9-]+$/;

  private constructor(props: StickerTagProps) {
    super(props);
  }

  public static create(tag: string): Result<StickerTag, InvalidTagError> {
    if (!tag) {
      return Result.fail(new InvalidTagError("El tag no puede estar vacío"));
    }

    const trimmedTag = tag.trim().toLowerCase();

    if (trimmedTag.length < StickerTag.MIN_LENGTH) {
      return Result.fail(new InvalidTagError(`El tag '${tag}' es demasiado corto (mínimo ${StickerTag.MIN_LENGTH} caracteres)`));
    }

    if (trimmedTag.length > StickerTag.MAX_LENGTH) {
      return Result.fail(new InvalidTagError(`El tag '${tag}' es demasiado largo (máximo ${StickerTag.MAX_LENGTH} caracteres)`));
    }

    if (!StickerTag.VALID_REGEX.test(trimmedTag)) {
      return Result.fail(new InvalidTagError(`El tag '${tag}' contiene caracteres inválidos (solo a-z, 0-9 y -)`));
    }

    return Result.ok(new StickerTag({ value: trimmedTag }));
  }

  get value(): string {
    return this.props.value;
  }
}
