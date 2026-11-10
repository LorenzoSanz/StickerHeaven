import { Result } from "../../../../shared/domain/Result";
import { DomainError } from "../../../../shared/domain/DomainError";
import type { CatalogProductInfo } from "@/shared/contracts/CatalogPorts";
import { StickerId } from "@/shared/domain/StickerId";

export type ProductInfo = CatalogProductInfo;

export interface CatalogGateway {
  getProductInfo(stickerId: StickerId): Promise<Result<ProductInfo, DomainError>>;
  getProductsInfo(stickerIds: StickerId[]): Promise<Result<ProductInfo[], DomainError>>;
  reduceStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>>;
  restoreStock(stickerId: StickerId, quantity: number): Promise<Result<void, DomainError>>;
}
