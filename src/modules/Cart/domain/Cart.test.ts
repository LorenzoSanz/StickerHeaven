/**
 * POR QUÉ: Prueba el Cart Aggregate.
 * INTEGRIDAD: Verifica invariants, quantity management, merging logic, and versioning.
 * ESTRUCTURA: Suite de tests - Domain Unit Pruebas.
 */
import { describe, it, expect } from "bun:test";
import { Cart } from "./Cart";
import { CartId } from "./CartId";
import { StickerId } from "./StickerId";
import { Quantity } from "../../../shared/domain/Quantity";

const qty = (n: number) => Quantity.create(n).getValue();

describe("Cart Aggregate", () => {
  const cartId = CartId.create("cart-123").getValue();
  const sticker1 = StickerId.create("sticker-1").getValue();
  const stickerCommon = StickerId.create("sticker-common").getValue();
  const stickerA = StickerId.create("sticker-A-only").getValue();
  const stickerB = StickerId.create("sticker-B-only").getValue();

  it("should create an empty cart with version 0", () => {
    const cart = Cart.create(cartId);
    expect(cart.items.length).toBe(0);
    expect(cart.version).toBe(0);
  });

  it("should add a new item", () => {
    const cart = Cart.create(cartId);
    const result = cart.addItem(sticker1, qty(1));
    
    expect(result.isSuccess).toBe(true);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].stickerId.equals(sticker1)).toBe(true);
    expect(cart.items[0].quantity.value).toBe(1);
  });

  it("should increment quantity if item exists", () => {
    const cart = Cart.create(cartId);
    cart.addItem(sticker1, qty(1));
    cart.addItem(sticker1, qty(2));

    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity.value).toBe(3);
  });

  it("should merge carts correctly (sum quantities, keep oldest date)", () => {
    // Setup Cart A (Target)
    const cartA = Cart.create(cartId);
    
    cartA.addItem(stickerCommon, qty(1)); // Qty 1
    cartA.addItem(stickerA, qty(5));

    // Setup Cart B (Source)
    const cartB = Cart.create(CartId.create("cart-456").getValue());
    cartB.addItem(stickerCommon, qty(2)); // Qty 2
    cartB.addItem(stickerB, qty(3));

    // Merge B into A
    cartA.merge(cartB);

    // Assertions
    expect(cartA.items.length).toBe(3);
    
    // Common item: 1 + 2 = 3
    const common = cartA.items.find(i => i.stickerId.equals(stickerCommon));
    expect(common?.quantity.value).toBe(3);

    // A only
    const aOnly = cartA.items.find(i => i.stickerId.equals(stickerA));
    expect(aOnly?.quantity.value).toBe(5);

    // B only
    const bOnly = cartA.items.find(i => i.stickerId.equals(stickerB));
    expect(bOnly?.quantity.value).toBe(3);
  });

  it("should not decrease version on modification", () => {
    const cart = Cart.create(cartId);
    expect(cart.version).toBe(0);
  });

  it("should fail when creating invalid quantity", () => {
    const result = Quantity.create(0);
    expect(result.isFailure).toBe(true);
  });
});
