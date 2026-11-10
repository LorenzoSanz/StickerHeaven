
import { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { getCookie, deleteCookie } from "hono/cookie";
import { SessionRepository } from "@/modules/Identity/domain/SessionRepository";
import { ILogger } from "@/shared/domain/ILogger";
import { cookieConfig } from "@/config/cookieConfig";

type Env = {
  Variables: {
    userId: string;
    sessionId: string;
  };
};

export const createAuthMiddleware = (sessionRepository: SessionRepository, logger: ILogger) => {
  return createMiddleware<Env>(async (c, next) => {
    const sessionId = getCookie(c, cookieConfig.session.name);

    if (!sessionId) {
      await next();
      return;
    }

    const sessionResult = await sessionRepository.findById(sessionId);

    if (sessionResult.isFailure) {
      logger.error("Error retrieving session", { error: sessionResult.error });
      await next();
      return;
    }

    const session = sessionResult.getValue();

    if (!session || !session.isValid()) {
      // Sesión inválida/expirada: eliminamos cookie para que el cliente no la siga enviando.
      logger.info("Invalid or expired session detected");
      deleteCookie(c, cookieConfig.session.name, {
        path: cookieConfig.session.path,
        secure: cookieConfig.session.secure,
        sameSite: cookieConfig.session.sameSite
      });
      await next();
      return;
    }

    // Usa .value para pasar el string primitivo esperado por Hono o usos posteriores
    c.set("userId", session.userId.value);
    
    // Guardamos sessionId para casos de uso como Logout, donde se invalida la sesión actual.
    c.set("sessionId", sessionId);

    await next();
  });
};
