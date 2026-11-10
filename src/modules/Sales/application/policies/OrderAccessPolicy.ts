import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Order } from "@/modules/Sales/domain/Order";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { UnauthorizedOrderAccessError } from "@/modules/Sales/domain/Errors";

export class OrderAccessPolicy {
  assertOwner(order: Order, customerId: CustomerId): Result<void, DomainError> {
    if (order.customerId.value !== customerId.value) {
      return Result.fail(new UnauthorizedOrderAccessError());
    }
    return Result.ok(undefined);
  }
}
