// POR QUÉ: Servicio para enviar correos electrónicos a través de SMTP.
import nodemailer from "nodemailer";
import { IEmailService } from "@/shared/domain/IEmailService";
import { Result } from "@/shared/domain/Result";
import type { ILogger } from "@/shared/domain/ILogger";

// POR QUÉ: Interfaz para el transporte de nodemailer.
type Transport = {
  sendMail(input: {
    from: string;
    to: string;
    subject: string;
    text: string;
  }): Promise<unknown>;
};

// POR QUÉ: Implementación concreta del servicio de correo electrónico SMTP.
export class SMTPEmailService implements IEmailService {
  private readonly transport: Transport;

  /**
   * POR QUÉ: Constructor para el servicio de correo electrónico SMTP.
   * INTEGRIDAD: Asegura que se proporcionen las credenciales necesarias para autenticarse en el servidor SMTP.
   */
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
  /**
   * POR QUÉ: Envía una confirmación de pedido por correo electrónico.
   * INTEGRIDAD: Asegura que el correo electrónico se envíe correctamente y se registre en el log.
   */

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
  /**
   * POR QUÉ: Envía una prueba de descuento por correo electrónico.
   * INTEGRIDAD: Asegura que el correo electrónico se envíe correctamente y se registre en el log.
   */

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
