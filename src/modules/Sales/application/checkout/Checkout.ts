import { CartGateway, CartItemDTO } from "@/modules/Sales/domain/gateways/CartGateway";
import { PaymentGateway } from "@/modules/Sales/domain/gateways/PaymentGateway";
import { OrderRepository } from "@/modules/Sales/domain/OrderRepository";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { Order } from "@/modules/Sales/domain/Order";
import { CreateOrder } from "../create-order/CreateOrder";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { CartEmptyError } from "@/modules/Sales/domain/Errors";

type CheckoutValue = { id: string; clientSecret: string };
type CheckoutResult = Result<CheckoutValue, DomainError>;

// A pending order younger than this, with the same items, is reused instead of creating a second
// one. Kept below the 30-minute unpaid-order sweep so a reused order is never about to be released.
const REUSE_WINDOW_MS = 15 * 60 * 1000;

function itemsKey(items: CartItemDTO[]): string {
  const normalized = items
    .map((i) => ({ stickerId: i.stickerId, quantity: i.quantity }))
    .sort((a, b) => a.stickerId.localeCompare(b.stickerId));
  return JSON.stringify(normalized);
}

function orderItemsKey(order: Order): string {
  return itemsKey(order.items.map((i) => ({ stickerId: i.stickerId.value, quantity: i.quantity.value })));
}

/**
 * Starts payment for the customer's cart.
 *
 * A repeated checkout (refresh, back button, second tab, another API instance) finds the pending
 * order in the database and returns its PaymentIntent again, so stock is reserved and an order
 * created only once. The in-memory map only joins requests that arrive at the same moment in this
 * process (a double click), which the database lookup alone could not see yet.
 */
export class Checkout {
  private readonly inFlightByKey = new Map<string, Promise<CheckoutResult>>();

  constructor(
    private readonly cartGateway: CartGateway,
    private readonly createOrder: CreateOrder,
    private readonly orderRepository: OrderRepository,
    private readonly paymentGateway: Pick<PaymentGateway, "getClientSecret">,
    private readonly now: () => Date = () => new Date()
  ) {}

  async execute(userId: string | null, anonymousId: string | null): Promise<CheckoutResult> {
    const cartResult = await this.cartGateway.getCartSnapshot(userId, anonymousId);
    if (cartResult.isFailure) return Result.fail(cartResult.error!);

    const { items } = cartResult.getValue();
    if (items.length === 0) {
      return Result.fail(new CartEmptyError());
    }
    if (!userId) {
      return Result.fail(
        new DomainError("User must be logged in to checkout (Guest checkout not fully implemented)")
      );
    }

    const key = `${userId}:${itemsKey(items)}`;
    const inFlight = this.inFlightByKey.get(key);
    if (inFlight) return await inFlight;

    const promise = this.reuseOrCreate(userId, items);
    this.inFlightByKey.set(key, promise);
    try {
      return await promise;
    } finally {
      this.inFlightByKey.delete(key);
    }
  }

  private async reuseOrCreate(userId: string, items: CartItemDTO[]): Promise<CheckoutResult> {
    const reused = await this.findReusableOrder(userId, items);
    return reused ?? (await this.createOrder.execute({ userId, items }));
  }

  /** Any failure here just means "nothing to reuse": checkout falls back to creating an order. */
  private async findReusableOrder(userId: string, items: CartItemDTO[]): Promise<CheckoutResult | null> {
    const customerId = CustomerId.create(userId);
    if (customerId.isFailure) return null;

    const since = new Date(this.now().getTime() - REUSE_WINDOW_MS);
    const ordersResult = await this.orderRepository.findPendingPaymentForCustomer(customerId.getValue(), since);
    if (ordersResult.isFailure) return null;

    const wanted = itemsKey(items);
    const match = ordersResult.getValue().find((o) => o.paymentIntentId && orderItemsKey(o) === wanted);
    if (!match?.paymentIntentId) return null;

    const secret = await this.paymentGateway.getClientSecret(match.paymentIntentId.value);
    if (secret.isFailure) return null;

    return Result.ok({ id: match.id.value, clientSecret: secret.getValue() });
  }
}
