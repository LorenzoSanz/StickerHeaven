import { createLazySingleton } from "../utils";
import type { ILogger } from "@/shared/domain/ILogger";
import type { IEmailService } from "@/shared/domain/IEmailService";
import { SubscribeToNewsletter } from "@/modules/Marketing/application/subscribe/SubscribeToNewsletter";
import { MarketingController } from "@/modules/Marketing/infrastructure/http/MarketingController";

// Proporciona servicios de marketing y controladores HTTP.
export function createMarketingModule(deps: { logger: () => ILogger; emailService: () => IEmailService }) {
  const useCases = {
    subscribeToNewsletter: createLazySingleton(() => new SubscribeToNewsletter(deps.emailService())),
  };
  
  // Proporciona controladores HTTP para interactuar con servicios de marketing.
  const controllers = {
    marketing: createLazySingleton(() => new MarketingController(useCases.subscribeToNewsletter(), deps.logger())),
  };
  
  // Proporciona servicios de marketing y controladores HTTP.
  return {
    useCases,
    controllers,
  };
}

