
import { Hono, MiddlewareHandler } from "hono";
import { zValidator } from "@hono/zod-validator";
import { IdentityController } from "./IdentityController";
import { RegisterUserSchema } from "../../application/register/RegisterUserDTO";
import { LoginUserSchema } from "../../application/login/LoginUserDTO";
import { UpdateUserProfileSchema } from "../../application/update-profile/UpdateUserProfileDTO";
import { ChangePasswordSchema } from "../../application/change-password/ChangePasswordDTO";
import { requireAuth } from "@/shared/infrastructure/http/requireAuth";

export function createIdentityRouter(controller: IdentityController, authMiddleware: MiddlewareHandler) {
  const app = new Hono();

  app.post("/register", zValidator("json", RegisterUserSchema), (c) => controller.register(c));
  app.post("/login", zValidator("json", LoginUserSchema), (c) => controller.login(c));
  app.post("/logout", authMiddleware, (c) => controller.logout(c));
  app.get("/me", authMiddleware, requireAuth, (c) => controller.me(c));
  
  app.put("/profile", authMiddleware, requireAuth, zValidator("json", UpdateUserProfileSchema), (c) => controller.updateProfile(c));
  app.put(
    "/profile/password",
    authMiddleware,
    requireAuth,
    zValidator("json", ChangePasswordSchema),
    (c) => controller.changePassword(c)
  );

  return app;
}
