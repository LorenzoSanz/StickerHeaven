/**
 * POR QUÉ: Representa un concepto del dominio.
 * INTEGRIDAD: Objeto de valor inmutable dentro del agregado Order.
 * ESTRUCTURA: Capa Domain.
 */
import { ValueObject } from "../../../shared/domain/ValueObject";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { Money } from "../../../shared/domain/Money";
import { Quantity } from "../../../shared/domain/Quantity";

import { StickerId } from "./StickerId";

export interface OrderItemProps {
  stickerId: StickerId;
  stickerName: string; // Snapshot
  stickerImageUrl: string; // Snapshot
  quantity: Quantity;
  unitPrice: Money;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class OrderItem extends ValueObject<OrderItemProps> {
  private constructor(props: OrderItemProps) {
    super(props);
  }

  public static create(
    stickerId: StickerId, 
    stickerName: string, 
    stickerImageUrl: string, 
    quantity: Quantity, 
    unitPrice: Money
  ): Result<OrderItem, DomainError> {
    if (!stickerName) return Result.fail(new DomainError("Sticker name is required for order snapshot"));
    // Image URL might be optional or checked? Let's require it for now to avoid empty boxes.
    if (!stickerImageUrl) return Result.fail(new DomainError("Sticker image URL is required for order snapshot"));

    return Result.ok(new OrderItem({ stickerId, stickerName, stickerImageUrl, quantity, unitPrice }));
  }

  get stickerId(): StickerId {
    return this.props.stickerId;
  }

  get stickerName(): string {
    return this.props.stickerName;
  }

  get stickerImageUrl(): string {
    return this.props.stickerImageUrl;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get totalPrice(): Money {
    // POR QUÉ: We know quantity is positive and price is valid, so multiplication shouldn't fail.
    return this.props.unitPrice.multiply(this.props.quantity.value).getValue();
  }
}
