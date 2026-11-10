import { Order } from "./Order";
import { CustomerId } from "./CustomerId";
import { OrderId } from "./OrderId";
import { PaymentIntentId } from "./PaymentIntentId";
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";

export interface OrderRepository {
  /**
   * Persists un pedido.
   * @param order - order aggregate.
   */
  save(order: Order): Promise<Result<void, DomainError>>;

  /**
   * Finds un pedido by its unique ID.
   */
  findById(id: OrderId): Promise<Result<Order | null, DomainError>>;

  /**
   * Finds all orders belonging to a specific customer.
   */
  findByCustomerId(customerId: CustomerId): Promise<Result<Order[], DomainError>>;

  /**
   * Finds un pedido by its associated payment intent ID (useful for webhooks).
   */
  findByPaymentIntentId(paymentIntentId: PaymentIntentId): Promise<Result<Order | null, DomainError>>;

  /**
   * Orders still waiting for payment that were created before the cutoff, oldest first.
   */
  findPendingPaymentCreatedBefore(cutoff: Date, limit: number): Promise<Result<Order[], DomainError>>;

  /**
   * Elimina un pedido (typically for administrative use or cleanup).
   */
  delete(id: OrderId): Promise<Result<void, DomainError>>;
}
