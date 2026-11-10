import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { CustomerId } from "../../domain/CustomerId";
import { OrderId } from "../../domain/OrderId";
import { OrderDTO } from "../OrderDTO";
import { SalesQueryService } from "../queries/SalesQueryService";
import { OrderReadAccessPolicy } from "../policies/OrderReadAccessPolicy";
import { OrderNotFoundError } from "../../domain/Errors";

export class GetOrderById {
  constructor(
    private readonly salesQueryService: SalesQueryService,
    private readonly orderReadAccessPolicy: OrderReadAccessPolicy = new OrderReadAccessPolicy()
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
    const accessResult = this.orderReadAccessPolicy.assertOwner(order, customerIdOrError.getValue().value);
    if (accessResult.isFailure) return Result.fail(accessResult.error!);

    return Result.ok(order);
  }
}
