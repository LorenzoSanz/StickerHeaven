import { IEmailService } from "../../domain/IEmailService";
import { Result } from "../../domain/Result";
import { ILogger } from "../../domain/ILogger";

export class ConsoleEmailService implements IEmailService {
  constructor(private logger: ILogger) {}

  async sendOrderConfirmation(to: string, orderId: string, totalAmount: number, currency: string): Promise<Result<void, Error>> {
    this.logger.info(`[EmailService] Enviando confirmación de pedido a ${to}`);
    this.logger.info(`Asunto: Confirmación de pedido #${orderId}`);
    this.logger.info(`Cuerpo: Gracias por tu compra. Total: ${totalAmount} ${currency}`);
    return Result.ok();
  }

  async sendNewsletterDiscountTest(to: string): Promise<Result<void, Error>> {
    this.logger.info(`[EmailService] Enviando descuento de prueba de newsletter a ${to}`);
    this.logger.info("Asunto: Bienvenido a StickerHeaven — descuento de prueba");
    this.logger.info("Cuerpo: ¡Gracias por suscribirte! Aquí tienes tu código de prueba: FAKE10 (no canjeable).");
    return Result.ok();
  }
}
