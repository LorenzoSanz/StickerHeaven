import { DomainError } from "@/shared/domain/DomainError";
import { Result } from "@/shared/domain/Result";

export type CatalogProductInfo = {
  id: string;
  name?: string;
  imageUrl?: string;
  priceAmount: number;
  priceCurrency: string;
  stock: number;
};

export interface CatalogReadPort {
  getProductInfo(id: string): Promise<Result<CatalogProductInfo, DomainError>>;
  getProductsInfo(ids: string[]): Promise<Result<CatalogProductInfo[], DomainError>>;
}

export interface CatalogStockPort {
  reduceStock(id: string, quantity: number): Promise<Result<void, DomainError>>;
  restoreStock(id: string, quantity: number): Promise<Result<void, DomainError>>;
}
