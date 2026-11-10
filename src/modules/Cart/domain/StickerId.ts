/**
 * POR QUÉ: Representa la identidad de un Sticker Product.
 * INTEGRIDAD: Valida invariantes del valor.
 * ESTRUCTURA: Capa Domain - Objeto de Valor.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface StickerIdProps {
  value: string;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class StickerId extends ValueObject<StickerIdProps> {
  private constructor(props: StickerIdProps) {
    super(props);
  }

  public static create(value: string): Result<StickerId, DomainError> {
    if (!value || value.length === 0) {
      return Result.fail(new DomainError("Sticker ID cannot be empty"));
    }
    return Result.ok(new StickerId({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
