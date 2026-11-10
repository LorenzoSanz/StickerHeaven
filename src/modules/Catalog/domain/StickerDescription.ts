/**
 * POR QUÉ: Objeto de Valor para Sticker Description.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface StickerDescriptionProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class StickerDescription extends ValueObject<StickerDescriptionProps> {
  private static readonly MAX_LENGTH = 500;

  private constructor(props: StickerDescriptionProps) {
    super(props);
  }

  public static create(description: string): Result<StickerDescription, DomainError> {
    if (description && description.length > StickerDescription.MAX_LENGTH) {
      return Result.fail<StickerDescription, DomainError>(new DomainError(`Sticker description cannot exceed ${StickerDescription.MAX_LENGTH} characters`));
    }
    return Result.ok<StickerDescription, DomainError>(new StickerDescription({ value: description || "" }));
  }

  get value(): string {
    return this.props.value;
  }
}
