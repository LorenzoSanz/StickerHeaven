import nodemailer from "nodemailer";
import { IEmailService } from "@/shared/domain/IEmailService";
import { Result } from "@/shared/domain/Result";
import type { ILogger } from "@/shared/domain/ILogger";

type Transport = {
  sendMail(input: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
};

export class SMTPEmailService implements IEmailService {
  private readonly transport: Transport;

  constructor(
    private readonly logger: ILogger,
    private readonly config: {
      host: string;
      port: number;
      user?: string;
      pass?: string;
      from: string;
    },
    transport?: Transport
  ) {
    this.transport =
      transport ??
      nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: false,
        auth: config.user && config.pass ? { user: config.user, pass: config.pass } : undefined,
        connectionTimeout: 5_000,
        greetingTimeout: 5_000,
        socketTimeout: 10_000,
      });
  }

  async sendOrderConfirmation(to: string, orderId: string, totalAmount: number, currency: string): Promise<Result<void, Error>> {
    try {
      await this.transport.sendMail({
        from: this.config.from,
        to,
        subject: `Confirmación de pedido #${orderId}`,
        text: `Gracias por tu compra. Total: ${totalAmount} ${currency}`,
      });

      this.logger.info("Email sent", { kind: "order_confirmation", to, orderId });
      return Result.ok();
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.logger.error("Email send failed", { kind: "order_confirmation", to, orderId, error: err.message });
      return Result.fail(err);
    }
  }

  async sendNewsletterDiscountTest(to: string): Promise<Result<void, Error>> {
    try {
      await this.transport.sendMail({
        from: this.config.from,
        to,
        subject: "Bienvenido a StickerHeaven — descuento de prueba",
        text: "¡Gracias por suscribirte! Aquí tienes tu código de prueba: FAKE10 (no canjeable).",
      });

      this.logger.info("Email sent", { kind: "newsletter_test_discount", to });
      return Result.ok();
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      this.logger.error("Email send failed", { kind: "newsletter_test_discount", to, error: err.message });
      return Result.fail(err);
    }
  }
}
