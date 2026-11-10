import { createLazySingleton } from "../utils";
import type { ILogger } from "@/shared/domain/ILogger";
import type { IEmailService } from "@/shared/domain/IEmailService";
import { SubscribeToNewsletter } from "@/modules/Marketing/application/subscribe/SubscribeToNewsletter";
import { MarketingController } from "@/modules/Marketing/infrastructure/http/MarketingController";

export function createMarketingModule(deps: { logger: () => ILogger; emailService: () => IEmailService }) {
  const useCases = {
    subscribeToNewsletter: createLazySingleton(() => new SubscribeToNewsletter(deps.emailService())),
  };
  
  const controllers = {
    marketing: createLazySingleton(() => new MarketingController(useCases.subscribeToNewsletter(), deps.logger())),
  };
  
  return {
    useCases,
    controllers,
  };
}

