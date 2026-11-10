import { DomainError } from "@/shared/domain/DomainError";

export class ProductNotFoundError extends DomainError {
  constructor(productId: string, message?: string) {
    super(message ?? `Producto no encontrado o no disponible: ${productId}`);
    this.name = "ProductNotFoundError";
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productId: string, requested: number, available: number, message?: string) {
    super(message ?? `Stock insuficiente para el producto: ${productId}`);
    this.name = "InsufficientStockError";
  }
}

export class OrderNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Pedido no encontrado");
    this.name = "OrderNotFoundError";
  }
}

export class UnauthorizedOrderAccessError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Acceso no autorizado al pedido");
    this.name = "UnauthorizedOrderAccessError";
  }
}

export class OrderAlreadyCancelledError extends DomainError {
  constructor(message?: string) {
    super(message ?? "El pedido ya está cancelado");
    this.name = "OrderAlreadyCancelledError";
  }
}

export class OrderNotCancellableError extends DomainError {
  constructor(message?: string) {
    super(message ?? "No se puede cancelar un pedido que ya fue enviado o entregado");
    this.name = "OrderNotCancellableError";
  }
}

export class UserIdRequiredToCreateOrderError extends DomainError {
  constructor(message?: string) {
    super(message ?? "Se requiere un usuario para crear un pedido");
    this.name = "UserIdRequiredToCreateOrderError";
  }
}

export class CartEmptyError extends DomainError {
  constructor(message?: string) {
    super(message ?? "El carrito está vacío");
    this.name = "CartEmptyError";
  }
}
