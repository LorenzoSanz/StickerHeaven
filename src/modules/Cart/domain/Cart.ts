/**
 * POR QUÉ: Raíz de Agregado del contexto correspondiente.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Capa Domain - Raíz de Agregado.
 */
import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { Result } from "../../../shared/domain/Result";
import { CartId } from "./CartId";
import { CartItem } from "./CartItem";
import { StickerId } from "./StickerId";
import { OwnerId } from "./OwnerId";
import { InvalidCartItemQuantityError, CartItemNotFoundError } from "./Errors";
import { AnonymousCartId } from "./AnonymousCartId";
import { Quantity } from "../../../shared/domain/Quantity";

interface CartProps {
  userId: OwnerId | null;
  anonymousId: AnonymousCartId | null;
  items: CartItem[];
  version: number;
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class Cart extends AggregateRoot<CartProps, CartId> {
  private constructor(props: CartProps, id: CartId) {
    super(props, id);
  }

  public static create(id: CartId, userId: OwnerId | null = null, anonymousId: AnonymousCartId | null = null): Cart {
    return new Cart({
      userId,
      anonymousId,
      items: [],
      version: 0
    }, id);
  }

  public static reconstitute(props: CartProps, id: CartId): Cart {
    return new Cart({
      ...props,
      items: [...props.items],
    }, id);
  }

  get items(): CartItem[] {
    return [...this.props.items];
  }

  get userId(): OwnerId | null {
    return this.props.userId;
  }

  get anonymousId(): AnonymousCartId | null {
    return this.props.anonymousId;
  }

  get version(): number {
    return this.props.version;
  }

  public addItem(stickerId: StickerId, quantity: Quantity): Result<void, InvalidCartItemQuantityError> {
    const existingItemIndex = this.props.items.findIndex(i => i.stickerId.equals(stickerId));

    if (existingItemIndex !== -1) {
      const existingItem = this.props.items[existingItemIndex];
      const result = existingItem.incrementQuantity(quantity);
      if (result.isFailure) return Result.fail(result.error);
      
      this.props.items[existingItemIndex] = result.getValue();
    } else {
      const newItemResult = CartItem.create(stickerId, quantity);
      if (newItemResult.isFailure) return Result.fail(newItemResult.error);
      
      this.props.items.push(newItemResult.getValue());
    }

    return Result.ok<void, InvalidCartItemQuantityError>();
  }

  public removeItem(stickerId: StickerId): Result<void, CartItemNotFoundError> {
    const initialLength = this.props.items.length;
    this.props.items = this.props.items.filter(i => !i.stickerId.equals(stickerId));
    
    if (this.props.items.length === initialLength) {
      return Result.fail(new CartItemNotFoundError(stickerId.value));
    }
    return Result.ok<void, CartItemNotFoundError>();
  }

  public updateItemQuantity(stickerId: StickerId, quantity: Quantity): Result<void, InvalidCartItemQuantityError | CartItemNotFoundError> {
    const index = this.props.items.findIndex(i => i.stickerId.equals(stickerId));
    if (index === -1) return Result.fail(new CartItemNotFoundError(stickerId.value));

    const result = this.props.items[index].updateQuantity(quantity);
    if (result.isFailure) return Result.fail(result.error);

    this.props.items[index] = result.getValue();
    return Result.ok<void, InvalidCartItemQuantityError | CartItemNotFoundError>();
  }

  public merge(otherCart: Cart): void {
    for (const otherItem of otherCart.items) {
      const existingItemIndex = this.props.items.findIndex(i => i.stickerId.equals(otherItem.stickerId));

      if (existingItemIndex !== -1) {
        const existingItem = this.props.items[existingItemIndex];
        
        // Cantidad: sumamos cantidades para consolidar el item duplicado.
        const newQuantityResult = existingItem.quantity.add(otherItem.quantity);
        if (newQuantityResult.isFailure) {
             // No debería ocurrir: Quantity valida enteros positivos; esto solo fallaría por overflow/unsafe integer.
             continue; 
        }
        
        // Fecha: preservamos la más antigua para mantener “addedAt” estable al mergear.
        const oldestDate = existingItem.addedAt < otherItem.addedAt ? existingItem.addedAt : otherItem.addedAt;
        
        // Usamos create para fijar explícitamente la fecha calculada.
        const mergedItem = CartItem.create(existingItem.stickerId, newQuantityResult.getValue(), oldestDate).getValue();
        
        this.props.items[existingItemIndex] = mergedItem;
      } else {
        // Item nuevo: lo incorporamos tal cual (Value Object inmutable).
        this.props.items.push(otherItem);
      }
    }
  }

  public assignToUser(userId: OwnerId): void {
    this.props.userId = userId;
    // El anonymousId puede mantenerse (trazabilidad) o limpiarse; la política actual lo delega al proceso de merge/login.
  }
}
