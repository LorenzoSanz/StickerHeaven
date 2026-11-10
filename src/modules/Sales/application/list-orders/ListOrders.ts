import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";
import { ListOrdersDTO } from "./ListOrdersDTO";
import { SalesQueryService } from "../queries/SalesQueryService";

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
