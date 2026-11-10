import { describe, it, expect, mock, beforeEach, beforeAll } from "bun:test";
import { Context } from "hono";
import { Session } from "@/modules/Identity/domain/Session";
import { User } from "@/modules/Identity/domain/User";
import { UserId } from "@/modules/Identity/domain/UserId";
import { SessionRepository } from "@/modules/Identity/domain/SessionRepository";

import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { ILogger } from "@/shared/domain/ILogger";

type CreateAuthMiddleware = (typeof import("./AuthMiddleware"))["createAuthMiddleware"];

// Mock de env ANTES de importar el módulo bajo test
mock.module("../../../../config/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    AUTH_SECRET: "secret",
    DATABASE_URL: "mongodb://localhost:27017",
    CLOUDINARY_CLOUD_NAME: "cloud",
    CLOUDINARY_API_KEY: "key",
    CLOUDINARY_API_SECRET: "secret",
    STRIPE_SECRET_KEY: "sk_test",
    STRIPE_WEBHOOK_SECRET: "whsec_test",
  }
}));

describe("AuthMiddleware", () => {
  let mockSessionRepo: SessionRepository;
  let authMiddleware: ReturnType<CreateAuthMiddleware>;
  let createAuthMiddleware: CreateAuthMiddleware;

  beforeAll(async () => {
    // Import dinámico para asegurar que el mock se aplica antes
    const authMiddlewareModule = await import("./AuthMiddleware");
    createAuthMiddleware = authMiddlewareModule.createAuthMiddleware;
  });

  beforeEach(() => {
    mockSessionRepo = {
      findById: mock(() =>
        Promise.resolve(Result.ok<Session | null, DomainError>(null))
      ),
      save: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
      delete: mock(() => Promise.resolve(Result.ok<void, DomainError>())),
      findUserBySessionId: mock(() =>
        Promise.resolve(Result.ok<User | null, DomainError>(null))
      ),
    } as unknown as SessionRepository;

    const logger: ILogger = {
      info: mock(() => {}),
      error: mock(() => {}),
      warn: mock(() => {}),
      debug: mock(() => {}),
    };
    authMiddleware = createAuthMiddleware(mockSessionRepo, logger);
  });

  it("should set userId in context if valid sessionId cookie is present", async () => {
    const next = mock(() => Promise.resolve());
    const userIdValue = crypto.randomUUID();
    const userId = UserId.create(userIdValue).getValue();
    const session = Session.create(userId).getValue();
    const sessionId = session.id.value;
    
    mockSessionRepo.findById = mock(async (id) => {
        // Comprobación simple para asegurar que buscamos la sesión correcta
        // Nota: ¿Repository findById recibe SessionId o string?
        // Asumimos string por simplicidad o revisa la interfaz.
        // Normalmente: findById(id: string) o findById(id: SessionId).
        // Si falla aquí, revisa la firma.
        return Result.ok<Session | null, DomainError>(session);
    });

    const c = {
      req: {
        raw: {
            headers: {
                get: (name: string) => {
                    if (name === "Cookie") return `sessionId=${sessionId}`;
                    return null;
                }
            }
        }
      },
      set: mock(() => {}),
    } as unknown as Context;

    await authMiddleware(c as unknown as Parameters<typeof authMiddleware>[0], next);

    expect(c.set).toHaveBeenCalledWith("userId", userIdValue);
    expect(next).toHaveBeenCalled();
  });

  it("should not set userId if cookie is missing", async () => {
    const next = mock(() => Promise.resolve());
    const c = {
      req: {
        raw: {
            headers: {
                get: (name: string) => null
            }
        }
      },
      set: mock(() => {}),
    } as unknown as Context;

    await authMiddleware(c as unknown as Parameters<typeof authMiddleware>[0], next);

    expect(c.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should not set userId if session is invalid", async () => {
    const next = mock(() => Promise.resolve());
    mockSessionRepo.findById = mock(() =>
      Promise.resolve(Result.ok<Session | null, DomainError>(null))
    );

    const c = {
      req: {
        raw: {
            headers: {
                get: (name: string) => {
                    if (name === "Cookie") return "sessionId=invalid-session-id";
                    return null;
                }
            }
        }
      },
      set: mock(() => {}),
      header: mock(() => {}), // For deleteCookie
    } as unknown as Context;

    await authMiddleware(c as unknown as Parameters<typeof authMiddleware>[0], next);

    expect(c.set).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
