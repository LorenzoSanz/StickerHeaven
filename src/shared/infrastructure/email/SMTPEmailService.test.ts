import { describe, it, expect } from "bun:test";
import { SMTPEmailService } from "./SMTPEmailService";
import { Result } from "@/shared/domain/Result";

describe("SMTPEmailService", () => {
  it("should send an order confirmation email", async () => {
    let sent: { from: string; to: string; subject: string; text: string } | null = null;

    const service = new SMTPEmailService(
      { info: () => {}, warn: () => {}, error: () => {} } as any,
      { host: "127.0.0.1", port: 1025, from: "no-reply@stickerheaven.local" },
      {
        sendMail: async (input: { from: string; to: string; subject: string; text: string }) => {
          sent = input;
          return Result.ok();
        },
      } as any
    );

    const res = await service.sendOrderConfirmation("a@b.com", "order_1", 10, "EUR");

    expect(res.isSuccess).toBe(true);
    expect(sent).not.toBeNull();
    expect(sent!).toEqual({
      from: "no-reply@stickerheaven.local",
      to: "a@b.com",
      subject: "Confirmación de pedido #order_1",
      text: "Gracias por tu compra. Total: 10 EUR",
    });
  });

  it("should return failure when transport errors", async () => {
    const service = new SMTPEmailService(
      { info: () => {}, warn: () => {}, error: () => {} } as any,
      { host: "127.0.0.1", port: 1025, from: "no-reply@stickerheaven.local" },
      {
        sendMail: async () => {
          throw new Error("smtp down");
        },
      }
    );

    const res = await service.sendOrderConfirmation("a@b.com", "order_1", 10, "EUR");
    expect(res.isFailure).toBe(true);
    expect(res.error?.message).toBe("smtp down");
  });
});
