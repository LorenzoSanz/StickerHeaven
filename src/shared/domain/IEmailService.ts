/**
 * POR QUÉ: Interface for sending emails.
 * INTEGRIDAD: Decouples domain from email provider.
 * ESTRUCTURA: Shared Domain.
 */
import { Result } from "./Result";

export interface IEmailService {
  sendOrderConfirmation(to: string, orderId: string, totalAmount: number, currency: string): Promise<Result<void, Error>>;
  sendNewsletterDiscountTest(to: string): Promise<Result<void, Error>>;
}
