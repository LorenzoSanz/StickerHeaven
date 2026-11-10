import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";

export interface SalesQueryService {
  getOrderById(orderId: string): Promise<Result<OrderDTO | null, DomainError>>;
  listOrdersByCustomer(customerId: string): Promise<Result<OrderDTO[], DomainError>>;
}
