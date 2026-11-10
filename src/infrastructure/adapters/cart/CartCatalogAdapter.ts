/**
 * POR QUÉ: Adaptador del módulo Cart para comunicarse con el módulo Catalog.
 * INTEGRIDAD: Implementa los métodos de CatalogGateway para interactuar con el módulo Catalog.
 * ESTRUCTURA: Capa de infraestructura (Cart Adapter).
 */
import { CatalogGateway, ProductInfo } from "@/modules/Cart/application/CatalogGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/modules/Cart/domain/StickerId";
import { CatalogReadPort } from "@/shared/contracts/CatalogPorts";

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export class CartCatalogAdapter implements CatalogGateway {
  constructor(
      private catalogReadPort: CatalogReadPort
  ) {}

  async getProductInfo(stickerId: StickerId): Promise<Result<ProductInfo, DomainError>> {
    const result = await this.catalogReadPort.getProductInfo(stickerId.value);
    
    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    return Result.ok(result.getValue());
  }

  async getProductsInfo(stickerIds: StickerId[]): Promise<Result<ProductInfo[], DomainError>> {
    const ids = stickerIds.map(id => id.value);
    const result = await this.catalogReadPort.getProductsInfo(ids);

    if (result.isFailure) {
        return Result.fail(result.error!);
    }

    return Result.ok(result.getValue());
  }
}
