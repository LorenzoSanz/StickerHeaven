import { describe, expect, it } from "bun:test";
import { CartItem } from "./CartItem";
import { StickerId } from "./StickerId";
import { Quantity } from "@/shared/domain/Quantity";

describe("CartItem immutability", () => {
  it("does not expose a mutable Date reference", () => {
    const stickerId = StickerId.create("s1").getValue();
    const quantity = Quantity.create(1).getValue();
    const initial = new Date("2020-01-01T00:00:00.000Z");

    const item = CartItem.create(stickerId, quantity, initial).getValue();
    const leaked = item.addedAt;
    leaked.setTime(0);

    expect(item.addedAt.toISOString()).toBe("2020-01-01T00:00:00.000Z");
  });
});

