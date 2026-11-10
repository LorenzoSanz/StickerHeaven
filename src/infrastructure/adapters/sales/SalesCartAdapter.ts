import { CartGateway, CartItemDTO, CartSnapshotDTO } from "@/modules/Sales/domain/gateways/CartGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import type { CartReadPort, CartWritePort } from "@/shared/contracts/CartPorts";
import { ConcurrencyError } from "@/shared/domain/ConcurrencyError";

export class SalesCartAdapter implements CartGateway {
  constructor(
    private readonly cartWritePort: CartWritePort,
    private readonly cartReadPort: CartReadPort
  ) {}

  async clearCart(userId: string | null, anonymousId: string | null): Promise<Result<void, DomainError | ConcurrencyError>> {
    return await this.cartWritePort.clearCart(userId, anonymousId);
  }

  async getCartSnapshot(
    userId: string | null,
    anonymousId: string | null
  ): Promise<Result<CartSnapshotDTO, DomainError>> {
    const result = await this.cartReadPort.getCartSnapshot(userId, anonymousId);

    if (result.isFailure) {
      return Result.fail(result.error!);
    }

    const cart = result.getValue();
    const items: CartItemDTO[] = cart.items.map((item) => ({ stickerId: item.stickerId, quantity: item.quantity }));
    return Result.ok({ id: cart.id, items });
  }
}
