import { CatalogGateway, ProductInfo } from "@/modules/Cart/application/CatalogGateway";
import { Result } from "@/shared/domain/Result";
import { DomainError } from "@/shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";
import { CatalogReadPort } from "@/shared/contracts/CatalogPorts";

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
