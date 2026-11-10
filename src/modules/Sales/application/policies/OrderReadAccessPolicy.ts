import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { OrderDTO } from "../OrderDTO";
import { UnauthorizedOrderAccessError } from "@/modules/Sales/domain/Errors";

export class OrderReadAccessPolicy {
  assertOwner(order: OrderDTO, customerId: string): Result<void, DomainError> {
    if (order.customerId !== customerId) {
      return Result.fail(new UnauthorizedOrderAccessError());
    }
    return Result.ok<void, DomainError>();
  }
}
