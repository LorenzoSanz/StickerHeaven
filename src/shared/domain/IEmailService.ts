import { Result } from "./Result";

export interface IEmailService {
  sendOrderConfirmation(to: string, orderId: string, totalAmount: number, currency: string): Promise<Result<void, Error>>;
  sendNewsletterDiscountTest(to: string): Promise<Result<void, Error>>;
}
