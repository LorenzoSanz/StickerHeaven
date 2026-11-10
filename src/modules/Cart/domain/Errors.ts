import { DomainError } from "@/shared/domain/DomainError";

export class InvalidCartItemQuantityError extends DomainError {
  constructor(quantity: number) {
    super(`Invalid quantity: ${quantity}`);
    this.name = "InvalidCartItemQuantityError";
  }
}

export class CartItemNotFoundError extends DomainError {
  constructor(stickerId: string) {
    super(`Cart item not found: ${stickerId}`);
    this.name = "CartItemNotFoundError";
  }
}
