
import { Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { setSessionCookie, deleteSessionCookie } from "@/config/sessionCookie";
import { RegisterUser, UserAlreadyExistsError } from "../../application/register/RegisterUser";
import { LoginUser, InvalidCredentialsError } from "../../application/login/LoginUser";
import { LogoutUser } from "../../application/logout/LogoutUser";
import { UpdateUserProfile } from "../../application/update-profile/UpdateUserProfile";
import { ChangePassword } from "../../application/change-password/ChangePassword";
import { RegisterUserDTO } from "../../application/register/RegisterUserDTO";
import { LoginUserDTO } from "../../application/login/LoginUserDTO";
import { UpdateUserProfileDTO } from "../../application/update-profile/UpdateUserProfileDTO";
import { ChangePasswordDTO } from "../../application/change-password/ChangePasswordDTO";
import { SessionId } from "../../domain/SessionId";
import { UserId } from "../../domain/UserId";
import { env } from "@/config/env";
import { OnLoginSuccess } from "../../application/interfaces/OnLoginSuccess";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import { cookieConfig } from "@/config/cookieConfig";
import { ILogger } from "@/shared/domain/ILogger";
import { SessionQueryService } from "../../application/queries/SessionQueryService";

export class IdentityController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly loginUser: LoginUser,
    private readonly logoutUser: LogoutUser,
    private readonly updateUserProfile: UpdateUserProfile,
    private readonly changePasswordUseCase: ChangePassword,
    private readonly onLoginSuccess: OnLoginSuccess,
    private readonly sessionQueryService: SessionQueryService,
    private readonly logger: ILogger
  ) {}

  /**
   * Gestiona peticiones de registro de usuario.
   * POST /auth/register
   *
   * @param c - Contexto de Hono que contiene el body (RegisterUserDTO).
   * @returns Respuesta JSON con 201 Created en éxito, o un estado de error.
   */
  public async register(c: Context): Promise<Response> {
    try {
      // El middleware asegura validación, pero el tipo de Context aquí es genérico.
      // Volvemos a json() para evitar error de TS, confiando en el middleware para seguridad en runtime.
      const dto = await c.req.json() as RegisterUserDTO;
      
      const result = await this.registerUser.execute(dto);

      if (result.isSuccess) {
        const loginResult = await this.loginUser.execute({ email: dto.email, password: dto.password });
        if (loginResult.isFailure) {
          this.logger.error("Usuario registrado, pero el auto-login falló", { error: loginResult.error });
          return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const { sessionId, user } = loginResult.getValue();

        setSessionCookie(
          {
            set: (name, value, opts) => setCookie(c, name, value, opts),
            delete: (name, opts) => deleteCookie(c, name, opts),
          },
          sessionId
        );

        const guestCartId = getCookie(c, cookieConfig.cart.name);

        const userIdResult = UserId.create(user.id);
        if (userIdResult.isSuccess) {
          await this.onLoginSuccess.execute(userIdResult.getValue(), guestCartId);
        } else {
          this.logger.warn("No se pudo crear UserId desde el resultado de login tras registro", {
            userId: user.id,
            error: userIdResult.error,
          });
        }

        this.logger.info("Usuario registrado correctamente (auto-login)", { userId: user.id });
        return c.json({ message: "Usuario registrado correctamente", user }, HttpStatus.CREATED);
      }

      const error = result.error;
      if (error instanceof UserAlreadyExistsError) {
        this.logger.warn("Registro fallido: el usuario ya existe");
        return c.json({ error: error.message }, HttpStatus.CONFLICT);
      }
      
      // Otros errores de dominio (validación, etc.)
      this.logger.warn("Registro fallido: solicitud inválida", { error: error?.message });
      return c.json({ error: error?.message || "Solicitud inválida" }, HttpStatus.BAD_REQUEST);

    } catch (e) {
      this.logger.error("Error del controller (Register)", e);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gestiona peticiones de login de usuario.
   * POST /auth/login
   *
   * @param c - Contexto de Hono que contiene el body (LoginUserDTO).
   * @returns Respuesta JSON con 200 OK y datos del usuario en éxito, o un estado de error.
   */
  public async login(c: Context): Promise<Response> {
    try {
      const dto = await c.req.json() as LoginUserDTO;
      
      const result = await this.loginUser.execute(dto);

      if (result.isSuccess) {
        const { sessionId, user } = result.getValue();

        setSessionCookie({
            set: (name, value, opts) => setCookie(c, name, value, opts),
            delete: (name, opts) => deleteCookie(c, name, opts)
        }, sessionId);

        const guestCartId = getCookie(c, cookieConfig.cart.name);
        
        const userIdResult = UserId.create(user.id);
        if (userIdResult.isSuccess) {
             await this.onLoginSuccess.execute(userIdResult.getValue(), guestCartId);
        } else {
             this.logger.warn("No se pudo crear UserId desde el resultado de login", { userId: user.id, error: userIdResult.error });
        }

        this.logger.info("Usuario autenticado correctamente", { userId: user.id });
        return c.json({ message: "Inicio de sesión correcto", user }, HttpStatus.OK);
      }

      this.logger.warn("Login fallido", { error: result.error?.message });
      
      // Mapear errores de dominio a códigos HTTP
      if (result.error instanceof InvalidCredentialsError) {
        return c.json({ error: result.error.message }, HttpStatus.UNAUTHORIZED);
      }
      
      return c.json({ error: result.error?.message || "No se pudo iniciar sesión" }, HttpStatus.BAD_REQUEST);

    } catch (e) {
      this.logger.error("Error del controller (Login)", e);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async me(c: Context): Promise<Response> {
    try {
      const sessionId = c.get("sessionId");
      if (!sessionId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      const user = await this.sessionQueryService.getSessionUser(sessionId);
      if (!user) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      return c.json({ user }, HttpStatus.OK);
    } catch (e) {
      this.logger.error("Error del controller (Me)", e);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gestiona peticiones de logout de usuario.
   * POST /auth/logout
   *
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con 200 OK en éxito.
   */
  public async logout(c: Context): Promise<Response> {
    try {
        const cookieSessionId = getCookie(c, cookieConfig.session.name) || c.get("sessionId");

        if (cookieSessionId) {
            const sessionIdResult = SessionId.create(cookieSessionId);
            if (sessionIdResult.isSuccess) {
                const logoutResult = await this.logoutUser.execute(sessionIdResult.getValue());
                if (logoutResult.isFailure) {
                    this.logger.error("Logout fallido (DB)", { error: logoutResult.error });
                    // Seguimos borrando la cookie aunque falle el borrado en DB, por seguridad/UX.
                }
            }
        }

        deleteSessionCookie({
            delete: (name, opts) => deleteCookie(c, name, opts),
            set: (name, value, opts) => setCookie(c, name, value, opts)
        });

        this.logger.info("Usuario deslogueado correctamente");
        const accept = c.req.header("accept") ?? "";
        if (accept.includes("application/json")) {
          return c.json({ message: "Cierre de sesión correcto" }, HttpStatus.OK);
        }
        return c.redirect("/", 303);
    } catch (e) {
        this.logger.error("Error de logout", e);
        return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gestiona actualizaciones de perfil (email, username).
   * PUT /auth/profile
   */
  public async updateProfile(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId"); // From AuthMiddleware
      if (!userId) return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);

      const body = await c.req.json();
      const dto: UpdateUserProfileDTO = {
        ...body,
        userId,
        requesterId: userId
      };
      
      const result = await this.updateUserProfile.execute(dto);

      if (result.isSuccess) {
        this.logger.info("Perfil actualizado correctamente", { userId });
        return c.json({ message: "Perfil actualizado correctamente" }, HttpStatus.OK);
      }

      this.logger.warn("Actualización de perfil fallida", { userId, error: result.error?.message });
      return c.json({ error: result.error?.message || "No se pudo actualizar el perfil" }, HttpStatus.BAD_REQUEST);

    } catch (e) {
        this.logger.error("Error al actualizar perfil", e);
        return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Gestiona cambios de contraseña.
   * PUT /auth/profile/password
   *
   * @param c - Contexto de Hono que contiene el body (ChangePasswordDTO).
   * @returns Respuesta JSON con 200 OK en éxito.
   */
  public async changePassword(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId");
      if (!userId) return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);

      const body = await c.req.json();
      const dto: ChangePasswordDTO = {
        ...body,
        userId
      };

      const result = await this.changePasswordUseCase.execute(dto);

      if (result.isSuccess) {
        this.logger.info("Contraseña cambiada correctamente", { userId });
        return c.json({ message: "Contraseña cambiada correctamente" }, HttpStatus.OK);
      }

      this.logger.warn("Cambio de contraseña fallido", { userId, error: result.error?.message });
      return c.json({ error: result.error?.message || "No se pudo cambiar la contraseña" }, HttpStatus.BAD_REQUEST);
    } catch (e) {
        this.logger.error("Error al cambiar contraseña:", e);
        return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
