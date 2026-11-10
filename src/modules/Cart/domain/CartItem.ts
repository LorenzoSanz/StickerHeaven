import { ValueObject } from "@/shared/domain/ValueObject";
import { Result } from "@/shared/domain/Result";
import { InvalidCartItemQuantityError } from "./Errors";
import { StickerId } from "@/shared/domain/StickerId";
import { Quantity } from "@/shared/domain/Quantity";

export interface CartItemProps {
  stickerId: StickerId;
  quantity: Quantity;
  addedAt: Date;
}

export class CartItem extends ValueObject<CartItemProps> {
  private constructor(props: CartItemProps) {
    super(props);
  }

  public static create(stickerId: StickerId, quantity: Quantity, addedAt?: Date): Result<CartItem, InvalidCartItemQuantityError> {
    return Result.ok(new CartItem({
      stickerId,
      quantity,
      addedAt: addedAt || new Date()
    }));
  }

  get stickerId(): StickerId {
    return this.props.stickerId;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get addedAt(): Date {
    return new Date(this.props.addedAt);
  }

  public incrementQuantity(amount: Quantity): Result<CartItem, InvalidCartItemQuantityError> {
    const newQuantityResult = this.quantity.add(amount);
    if (newQuantityResult.isFailure) {
      // No debería ocurrir: Quantity garantiza enteros positivos, y la suma mantiene el invariante salvo overflow/unsafe integer.
       return Result.fail(new InvalidCartItemQuantityError(this.quantity.value + amount.value));
    }
    return CartItem.create(this.stickerId, newQuantityResult.getValue(), this.addedAt);
  }

  public updateQuantity(newQuantity: Quantity): Result<CartItem, InvalidCartItemQuantityError> {
    return CartItem.create(this.stickerId, newQuantity, this.addedAt);
  }
}
