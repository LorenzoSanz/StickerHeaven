/**
 * PROPÓSITO: Test suite que valida contratos críticos y previene regresiones.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { OrderPaidSubscriber } from "./OrderPaidSubscriber";
import { OrderPaidEvent } from "@/modules/Sales/domain/events/OrderPaidEvent";
import { OrderId } from "@/modules/Sales/domain/OrderId";
import { CustomerId } from "@/modules/Sales/domain/CustomerId";
import { Money } from "@/shared/domain/Money";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { IEmailService } from "@/shared/domain/IEmailService";
import { UserContactQueryService } from "@/shared/contracts/UserContactQueryService";
import { ILogger } from "@/shared/domain/ILogger";

describe("OrderPaidSubscriber", () => {
  let subscriber: OrderPaidSubscriber;
  let mockEmailService: IEmailService;
  let mockUserContactQueryService: UserContactQueryService;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockEmailService = {
      sendOrderConfirmation: mock(() => Promise.resolve(Result.ok<void, Error>())),
      sendNewsletterDiscountTest: mock(() => Promise.resolve(Result.ok<void, Error>())),
    };

    mockUserContactQueryService = {
      getEmailByUserId: mock(() =>
        Promise.resolve(Result.ok<string | null, DomainError>("test@example.com"))
      ),
    };

    mockLogger = {
      debug: mock(() => {}),
      info: mock(() => {}),
      warn: mock(() => {}),
      error: mock(() => {}),
    };

    subscriber = new OrderPaidSubscriber(
      mockEmailService,
      mockUserContactQueryService,
      mockLogger
    );
  });

  it("should send confirmation email when order is paid", async () => {
    const event = new OrderPaidEvent(
      OrderId.create(crypto.randomUUID()).getValue(),
      CustomerId.create(crypto.randomUUID()).getValue(),
      Money.create(100, "USD").getValue()
    );

    await subscriber.on(event);

    expect(mockUserContactQueryService.getEmailByUserId).toHaveBeenCalledWith(event.customerId.value);
    expect(mockEmailService.sendOrderConfirmation).toHaveBeenCalledWith(
      "test@example.com",
      event.orderId.value,
      100,
      "USD"
    );
  });
});
