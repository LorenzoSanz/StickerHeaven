import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { StickerId } from "@/shared/domain/StickerId";
import type { CatalogProductInfo } from "@/shared/contracts/CatalogPorts";

export type ProductInfo = CatalogProductInfo;

export interface CatalogGateway {
  getProductsInfo(stickerIds: StickerId[]): Promise<Result<ProductInfo[], DomainError>>;
  getProductInfo(stickerId: StickerId): Promise<Result<ProductInfo, DomainError>>;
}
