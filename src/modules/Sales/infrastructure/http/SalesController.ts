import { Context } from "hono";
import { Checkout } from "@/modules/Sales/application/checkout/Checkout";
import { CancelOrder } from "@/modules/Sales/application/cancel-order/CancelOrder";
import { CreateOrder } from "@/modules/Sales/application/create-order/CreateOrder";
import { ListOrders } from "@/modules/Sales/application/list-orders/ListOrders";
import { GetOrderById } from "@/modules/Sales/application/get-order/GetOrderById";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import { ILogger } from "@/shared/domain/ILogger";
import { DomainError } from "@/shared/domain/DomainError";
import { getCookie } from "hono/cookie";
import { cookieConfig } from "@/config/cookieConfig";
import {
  InsufficientStockError,
  OrderAlreadyCancelledError,
  OrderNotCancellableError,
  OrderNotFoundError,
  ProductNotFoundError,
  UnauthorizedOrderAccessError,
} from "@/modules/Sales/domain/Errors";

export class SalesController {
  constructor(
    private createOrder: CreateOrder,
    private cancelOrder: CancelOrder,
    private listOrders: ListOrders,
    private getOrderById: GetOrderById,
    private checkoutUseCase: Checkout,
    private logger: ILogger
  ) {}

  private mapDomainErrorToHttpStatus(error: DomainError): 400 | 403 | 404 | 409 {
    if (error instanceof ProductNotFoundError || error instanceof OrderNotFoundError) return 404;
    if (error instanceof UnauthorizedOrderAccessError) return 403;
    if (error instanceof OrderAlreadyCancelledError) return 409;
    if (error instanceof OrderNotCancellableError) return 409;
    if (error instanceof InsufficientStockError) return 409;
    return 400;
  }

  /**
   * Inicia el proceso de checkout.
   * POST /sales/checkout
   * 
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con el ID del pedido y pago client secret.
   */
  async checkout(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as string;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      if (!userId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.checkoutUseCase.execute(userId, anonymousId);

      if (result.isFailure) {
        this.logger.warn("Checkout failed", { userId, error: result.error!.message });
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      const { id, clientSecret } = result.getValue();
      this.logger.info("Checkout successful", { orderId: id, userId });
      return c.json({ message: "Pedido creado correctamente", id, clientSecret }, HttpStatus.CREATED);
    } catch (error) {
      this.logger.error("Checkout Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Crea un pedido directamente (flujo interno o alternativo).
   * POST /sales/orders
   * 
   * @param c - Contexto de Hono que contiene items.
   * @returns Respuesta JSON con el ID del pedido.
   */
  async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json();
      
      const userId = c.get("userId") as string;

      if (!userId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      // Construimos el DTO explícitamente para asegurar que los tipos encajan
      // El middleware validador asegura que 'items' existe y es válido
      const dto = {
        userId,
        items: body.items,
      };

      const result = await this.createOrder.execute(dto);

      if (result.isFailure) {
        const error = result.error!;
        const status = this.mapDomainErrorToHttpStatus(error);
        this.logger.warn("Order creation failed", { userId, status, error: error.message });
        return c.json({ error: error.message }, status);
      }

      const { id, clientSecret } = result.getValue();
      this.logger.info("Order created successfully", { orderId: id, userId });
      return c.json({ message: "Pedido creado correctamente", id, clientSecret }, HttpStatus.CREATED);
    } catch (error) {
      this.logger.error("Create Order Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Lista pedidos del usuario actual.
   * GET /sales/orders
   * 
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con el lista de pedidos.
   */
  async list(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as string;
      if (!userId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.listOrders.execute(userId);

      if (result.isFailure) {
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json(result.getValue(), HttpStatus.OK);
    } catch (error) {
      this.logger.error("List Orders Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtiene un pedido por ID.
   * GET /sales/orders/:id
   * 
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con el detalles del pedido or 404.
   */
  async getById(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") as string;
      const orderId = c.req.param("id");

      if (!userId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      const result = await this.getOrderById.execute(orderId, userId);

      if (result.isFailure) {
        const error = result.error!;
        const status = this.mapDomainErrorToHttpStatus(error);
        return c.json({ error: error.message }, status);
      }

      return c.json(result.getValue(), HttpStatus.OK);
    } catch (error) {
      this.logger.error("Get Order By ID Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Cancela un pedido.
   * POST /sales/orders/:id/cancel
   * 
   * @param c - Contexto de Hono con motivo de cancelación.
   * @returns Respuesta JSON con 200 OK.
   */
  async cancel(c: Context): Promise<Response> {
    try {
      const orderId = c.req.param("id");
      const userId = c.get("userId") as string;
      const body = await c.req.json().catch(() => ({})) as { reason?: string };

      if (!userId) {
        return c.json({ error: "No autorizado" }, HttpStatus.UNAUTHORIZED);
      }

      const dto = {
        orderId,
        userId,
        reason: body.reason
      };

      const result = await this.cancelOrder.execute(dto);

      if (result.isFailure) {
        const error = result.error!;
        const status = this.mapDomainErrorToHttpStatus(error);
        return c.json({ error: error.message }, status);
      }

      this.logger.info("Order cancelled successfully", { orderId, userId });
      return c.json({ message: "Pedido cancelado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Cancel Order Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
