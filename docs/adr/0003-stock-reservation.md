# ADR 0003 — Reserve stock at checkout and release unpaid orders

- Status: accepted

## Context

Stickers have limited stock. Two buyers must not both pay for the last unit,
and a buyer who reaches the payment form should not lose the item while
typing their card details.

Stripe confirms payment asynchronously: the order is only known to be paid
when the `payment_intent.succeeded` webhook arrives, seconds or minutes later,
or never if the buyer gives up.

## Decision

Checkout creates the order, the Stripe PaymentIntent and reserves stock in one
use case (`CreateOrder`):

1. Prices come from the catalog, never from the client.
2. The PaymentIntent is created for the server-side total.
3. The order is saved as `PENDING_PAYMENT`, then stock is reduced per item with
   optimistic locking (`__v`); if any item fails, the PaymentIntent is cancelled
   and the order marked cancelled.

Reserved stock is given back by `ReleaseUnpaidOrders`:

- The API sweeps every 5 minutes for orders unpaid for 30 minutes.
- `payment_intent.canceled` releases an order immediately.
- Steps are ordered so the release is safe under races: cancel the
  PaymentIntent first (if Stripe already charged it, the cancel fails and the
  order is left for the succeeded webhook), then save the cancelled order with
  the optimistic lock, and only then restore stock, so it is never restored
  twice.

A repeated checkout of the same cart reuses the customer's pending order from
the last 15 minutes and returns its PaymentIntent again, so going back and
paying does not reserve stock twice. The window is below the 30-minute sweep.

## Consequences

- No overselling, and abandoned carts do not lock stock for long.
- An item can look out of stock for up to 30 minutes while someone else is
  paying. The window is a constant and can be tuned.
- The sweep runs inside the API process. With several instances each sweeps;
  the optimistic lock keeps that correct, at the cost of some duplicate reads.
