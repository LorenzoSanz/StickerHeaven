/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { describe, it, expect } from "bun:test";
import { OrderAccessPolicy } from "./OrderAccessPolicy";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { Order } from "@/modules/Sales/domain/Order";
import { OrderItem } from "@/modules/Sales/domain/OrderItem";
import { StickerId } from "@/modules/Sales/domain/StickerId";
import { Quantity } from "@/shared/domain/Quantity";
import { Money } from "@/shared/domain/Money";

describe("OrderAccessPolicy", () => {
  it("should allow the owner", () => {
    const owner = CustomerId.create("c1").getValue();
    const item = OrderItem.create(
      StickerId.create("s1").getValue(),
      "Sticker",
      "http://img",
      Quantity.create(1).getValue(),
      Money.create(100, "USD").getValue()
    ).getValue();
    const order = Order.create(owner, [item]).getValue();

    const policy = new OrderAccessPolicy();
    const result = policy.assertOwner(order, owner);

    expect(result.isSuccess).toBe(true);
  });

  it("should deny a non-owner", () => {
    const owner = CustomerId.create("c1").getValue();
    const other = CustomerId.create("c2").getValue();
    const item = OrderItem.create(
      StickerId.create("s1").getValue(),
      "Sticker",
      "http://img",
      Quantity.create(1).getValue(),
      Money.create(100, "USD").getValue()
    ).getValue();
    const order = Order.create(owner, [item]).getValue();

    const policy = new OrderAccessPolicy();
    const result = policy.assertOwner(order, other);

    expect(result.isFailure).toBe(true);
    expect(result.error?.message).toContain("no autorizado");
  });
});
