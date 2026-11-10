import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { CustomerId } from "../../domain/CustomerId";
import { OrderId } from "../../domain/OrderId";
import { OrderDTO } from "../OrderDTO";
import { SalesQueryService } from "../queries/SalesQueryService";
import { OrderNotFoundError, UnauthorizedOrderAccessError } from "../../domain/Errors";

export class GetOrderById {
  constructor(
    private readonly salesQueryService: SalesQueryService
  ) {}

  async execute(orderIdStr: string, userId: string): Promise<Result<OrderDTO, DomainError>> {
    const orderIdOrError = OrderId.create(orderIdStr);
    if (orderIdOrError.isFailure) {
      return Result.fail(orderIdOrError.error!);
    }

    const orderResult = await this.salesQueryService.getOrderById(orderIdOrError.getValue().value);
    if (orderResult.isFailure) return Result.fail(orderResult.error!);
    const order = orderResult.getValue();
    if (!order) {
      return Result.fail(new OrderNotFoundError());
    }

    const customerIdOrError = CustomerId.create(userId);
    if (customerIdOrError.isFailure) return Result.fail(customerIdOrError.error!);
    if (order.customerId !== customerIdOrError.getValue().value) return Result.fail(new UnauthorizedOrderAccessError());

    return Result.ok(order);
  }
}
