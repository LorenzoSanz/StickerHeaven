import { createLazySingleton } from "../utils";
import { env } from "@/config/env";
import { PinoLogger } from "@/infrastructure/logger/PinoLogger";
import { DomainEventPublisher } from "@/shared/infrastructure/events/DomainEventPublisher";
import { ConsoleEmailService } from "@/shared/infrastructure/email/ConsoleEmailService";
import { SMTPEmailService } from "@/shared/infrastructure/email/SMTPEmailService";

// Proporciona servicios compartidos como logger, eventPublisher y emailService.
export function createSharedModule() {
  const logger = createLazySingleton(() => new PinoLogger({ env: env.NODE_ENV }));
  const eventPublisher = createLazySingleton(() => DomainEventPublisher.getInstance(logger()));
  const emailService = createLazySingleton(() => {
    if (env.EMAIL_PROVIDER === "smtp") {
      if (!env.SMTP_HOST) {
        throw new Error("EMAIL_PROVIDER=smtp requires SMTP_HOST");
      }
      if (!env.SMTP_PORT) {
        throw new Error("EMAIL_PROVIDER=smtp requires SMTP_PORT");
      }
      if (!env.SMTP_FROM) {
        throw new Error("EMAIL_PROVIDER=smtp requires SMTP_FROM");
      }
      return new SMTPEmailService(logger(), {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
        from: env.SMTP_FROM,
      });
    }
    return new ConsoleEmailService(logger());
  });

  return {
    logger,
    eventPublisher,
    emailService,
  };
}
