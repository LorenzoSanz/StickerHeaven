/**
 * POR QUÉ: Adaptador del módulo Sales para comunicarse con el módulo Catalog.
 * INTEGRIDAD: Implements Sales' specific port using Catalog's use cases.
 * ESTRUCTURA: Capa de infraestructura (Sales Adapter).
 */
import { CatalogGateway, ProductInfo } from "@/modules/Sales/application/gateways/CatalogGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Quantity } from "@/shared/domain/Quantity";
import { StickerId } from "@/modules/Sales/domain/StickerId";
import { CatalogReadPort, CatalogStockPort } from "@/shared/contracts/CatalogPorts";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class SalesCatalogAdapter implements CatalogGateway {
  constructor(
      private catalogReadPort: CatalogReadPort,
      private catalogStockPort: CatalogStockPort
  ) {}

  /**
   * POR QUÉ: Obtener información de un producto es fundamental para la experiencia del usuario.
   * QUÉ: Expone una función para recuperar información detallada sobre un producto.
   * LÍMITES: No valida si el producto existe antes de intentar recuperarlo.
   */ 
  async getProductInfo(stickerId: StickerId): Promise<Result<ProductInfo, DomainError>> {
    const result = await this.catalogReadPort.getProductInfo(stickerId.value);
    
    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    return Result.ok(result.getValue());
  }
  /**
   * POR QUÉ: Obtener información de múltiples productos para mostrar catálogos completos.
   * QUÉ: Expone una función para recuperar información detallada sobre varios productos.
   * LÍMITES: No valida si los productos existen antes de intentar recuperarlos.
   */
  async getProductsInfo(stickerIds: StickerId[]): Promise<Result<ProductInfo[], DomainError>> {
    const ids = stickerIds.map(id => id.value);
    const result = await this.catalogReadPort.getProductsInfo(ids);

    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    return Result.ok(result.getValue());
  }

  /**
   * POR QUÉ: Reducir el stock de un producto es crítica para mantener la disponibilidad.
   * QUÉ: Expone una función para disminuir la cantidad disponible de un producto.
   * LÍMITES: No valida si el producto existe antes de intentar reducir su stock.
   */
  async reduceStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>> {
    const quantityResult = Quantity.create(quantity);
    if (quantityResult.isFailure) {
      return Result.fail(quantityResult.error!);
    }
    return await this.catalogStockPort.reduceStock(stickerId.value, quantityResult.getValue().value);
  }

  /**
   * POR QUÉ: Restaurar el stock de un producto es esencial para la gestión de inventario.
   * QUÉ: Expone una función para aumentar la cantidad disponible de un producto.
   * LÍMITES: No valida si el producto existe antes de intentar restaurar su stock.
   */ 
  async restoreStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>> {
    const quantityResult = Quantity.create(quantity);
    if (quantityResult.isFailure) {
      return Result.fail(quantityResult.error!);
    }
    return await this.catalogStockPort.restoreStock(stickerId.value, quantityResult.getValue().value);
  }
}
