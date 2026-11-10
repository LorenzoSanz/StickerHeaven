/**
 * POR QUÉ: Caso de uso para list all orders for a specific customer.
 * INTEGRIDAD: Devuelve solo pedidos que pertenecen al cliente.
 * ESTRUCTURA: Capa Application - Caso de uso.
 */
import { CustomerId } from "../../domain/CustomerId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";
import { ListOrdersDTO } from "./ListOrdersDTO";
import { SalesQueryService } from "../queries/SalesQueryService";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class ListOrders {
  constructor(private readonly salesQueryService: SalesQueryService) {}

  async execute(dto: ListOrdersDTO | string): Promise<Result<OrderDTO[], DomainError>> {
    const userId = typeof dto === 'string' ? dto : dto.userId;
    const customerIdOrError = CustomerId.create(userId);
    if (customerIdOrError.isFailure) {
      return Result.fail(customerIdOrError.error!);
    }

    return this.salesQueryService.listOrdersByCustomer(customerIdOrError.getValue().value);
  }
}
