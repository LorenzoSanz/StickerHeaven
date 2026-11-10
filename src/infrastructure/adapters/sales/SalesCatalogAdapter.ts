import { CatalogGateway, ProductInfo } from "@/modules/Sales/application/gateways/CatalogGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { Quantity } from "@/shared/domain/Quantity";
import { StickerId } from "@/shared/domain/StickerId";
import { CatalogReadPort, CatalogStockPort } from "@/shared/contracts/CatalogPorts";

export class SalesCatalogAdapter implements CatalogGateway {
  constructor(
      private catalogReadPort: CatalogReadPort,
      private catalogStockPort: CatalogStockPort
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

  async reduceStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>> {
    const quantityResult = Quantity.create(quantity);
    if (quantityResult.isFailure) {
      return Result.fail(quantityResult.error!);
    }
    return await this.catalogStockPort.reduceStock(stickerId.value, quantityResult.getValue().value);
  }

  async restoreStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>> {
    const quantityResult = Quantity.create(quantity);
    if (quantityResult.isFailure) {
      return Result.fail(quantityResult.error!);
    }
    return await this.catalogStockPort.restoreStock(stickerId.value, quantityResult.getValue().value);
  }
}
