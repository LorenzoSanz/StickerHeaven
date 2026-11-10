/**
 * POR QUÉ: Interface for reading sales data (orders).
 * INTEGRIDAD: Decouples application from read-side infrastructure (CQRS).
 * ESTRUCTURA: Capa Application - Port (Interface).
 */
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";

export interface SalesQueryService {
  getOrderById(orderId: string): Promise<Result<OrderDTO | null, DomainError>>;
  listOrdersByCustomer(customerId: string): Promise<Result<OrderDTO[], DomainError>>;
}
