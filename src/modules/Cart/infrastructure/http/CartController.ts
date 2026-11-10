import { Context } from "hono";
import { GetCart } from "@/modules/Cart/application/get/GetCart";
import { AddItemToCart } from "@/modules/Cart/application/add-item/AddItemToCart";
import { UpdateCartItemQuantity } from "@/modules/Cart/application/update-item/UpdateCartItemQuantity";
import { RemoveItemFromCart } from "@/modules/Cart/application/remove-item/RemoveItemFromCart";
import { ClearCart } from "@/modules/Cart/application/clear-cart/ClearCart";
import { ILogger } from "@/shared/domain/ILogger";
import { getCookie, setCookie } from "hono/cookie";
import { HttpStatus } from "@/shared/infrastructure/http/HttpStatus";
import { CartItemNotFoundError } from "@/modules/Cart/domain/Errors";
import { cookieConfig } from "@/config/cookieConfig";

export class CartController {
  constructor(
    private getCart: GetCart,
    private addItemToCart: AddItemToCart,
    private updateCartItemQuantity: UpdateCartItemQuantity,
    private removeItemFromCart: RemoveItemFromCart,
    private clearCart: ClearCart,
    private logger: ILogger
  ) {}

  /**
   * Obtiene el carrito del usuario actual o del invitado.
   * GET /cart
   * 
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con el contenido del carrito.
   *
   * NOTA DE DISEÑO: Si el carrito es anónimo y todavía no existe cookie, fijamos una nueva cookie con anonymousCartId
   * para que el navegador pueda recuperar el mismo carrito tras recargas y navegación.
   */
  async get(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") ?? null;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      const result = await this.getCart.execute(userId, anonymousId);

      if (result.isFailure) {
        if (result.error instanceof CartItemNotFoundError) {
          return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      const cartDTO = result.getValue();
      
      if (!userId && !anonymousId && cartDTO.anonymousCartId) {
        setCookie(c, cookieConfig.cart.name, cartDTO.anonymousCartId, {
            maxAge: cookieConfig.cart.maxAge,
            path: cookieConfig.cart.path,
            httpOnly: cookieConfig.cart.httpOnly,
            secure: cookieConfig.cart.secure,
            sameSite: cookieConfig.cart.sameSite
        });
      }

      return c.json(cartDTO, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Get Cart Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Añade un item al carrito.
   * POST /cart/items
   * 
   * @param c - Contexto de Hono con stickerId y quantity.
   * @returns Respuesta JSON con 200 OK.
   */
  async addItem(c: Context): Promise<Response> {
    try {
      const body = await c.req.json() as { stickerId: string; quantity: number };
      const userId = c.get("userId") ?? null;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      const dto = {
        userId,
        anonymousId: anonymousId,
        stickerId: body.stickerId,
        quantity: body.quantity
      };

      const result = await this.addItemToCart.execute(dto);

      if (result.isFailure) {
        if (result.error instanceof CartItemNotFoundError) {
          return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }
      
      const { cartId, anonymousId: newAnonymousId } = result.getValue();

      // Si somos guest y no tenemos cookie, la fijamos si se ha creado un carrito anónimo nuevo
      if (!userId && newAnonymousId && anonymousId !== newAnonymousId) {
          setCookie(c, cookieConfig.cart.name, newAnonymousId, {
            maxAge: cookieConfig.cart.maxAge,
            path: cookieConfig.cart.path,
            httpOnly: cookieConfig.cart.httpOnly,
            secure: cookieConfig.cart.secure,
            sameSite: cookieConfig.cart.sameSite
          });
      }
      
      return c.json({ message: "Producto añadido correctamente", cartId }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Add Item to Cart Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Actualiza la cantidad de un item en el carrito.
   * PUT /cart/items/:id
   * 
   * @param c - Contexto de Hono con la nueva cantidad.
   * @returns Respuesta JSON con 200 OK.
   */
  async updateItem(c: Context): Promise<Response> {
    try {
      const stickerId = c.req.param("id");
      const body = await c.req.json() as { quantity: number };
      const userId = c.get("userId") ?? null;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      const dto = {
        userId,
        anonymousId: anonymousId,
        stickerId: stickerId,
        quantity: body.quantity
      };

      const result = await this.updateCartItemQuantity.execute(dto);

      if (result.isFailure) {
        if (result.error instanceof CartItemNotFoundError) {
          return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json({ message: "Producto actualizado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Update Cart Item Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Elimina un item del carrito.
   * DELETE /cart/items/:id
   * 
   * @param c - Contexto de Hono.
   * @returns Respuesta JSON con 200 OK.
   */
  async removeItem(c: Context): Promise<Response> {
    try {
      const stickerId = c.req.param("id");
      const userId = c.get("userId") ?? null;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      const dto = {
        userId,
        anonymousId: anonymousId,
        stickerId: stickerId
      };

      const result = await this.removeItemFromCart.execute(dto);

      if (result.isFailure) {
        if (result.error instanceof CartItemNotFoundError) {
          return c.json({ error: result.error.message }, HttpStatus.NOT_FOUND);
        }
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json({ message: "Producto eliminado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Remove Cart Item Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async clear(c: Context): Promise<Response> {
    try {
      const userId = c.get("userId") ?? null;
      const anonymousId = getCookie(c, cookieConfig.cart.name) ?? null;

      const result = await this.clearCart.execute(userId, anonymousId);
      if (result.isFailure) {
        return c.json({ error: result.error!.message }, HttpStatus.BAD_REQUEST);
      }

      return c.json({ message: "Carrito vaciado correctamente" }, HttpStatus.OK);
    } catch (error) {
      this.logger.error("Clear Cart Error:", error);
      return c.json({ error: "Error interno del servidor" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
