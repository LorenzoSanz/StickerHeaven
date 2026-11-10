import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";

export interface StickerStockProps {
  value: number;
}

// Error cuando el stock es negativo.
export class InvalidStickerStockError extends DomainError {
  constructor(stock: number) {
    super(`El stock del sticker no puede ser negativo: ${stock}`);
  }
}

// Objeto de Valor para representar el stock disponible de un sticker.
export class StickerStock extends ValueObject<StickerStockProps> {
  private constructor(props: StickerStockProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }
  
  // Método estático para crear una instancia de StickerStock.
  public static create(stock: number): Result<StickerStock, InvalidStickerStockError> {
    if (stock < 0 || !Number.isInteger(stock)) {
      return Result.fail(new InvalidStickerStockError(stock));
    }
    return Result.ok(new StickerStock({ value: stock }));
  }
}
