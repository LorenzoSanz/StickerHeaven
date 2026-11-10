/**
 * POR QUÉ: Define el contrato para obtener información de productos del módulo Catalog.
 * INTEGRIDAD: Interface Adapter pattern.
 * ESTRUCTURA: Capa Application - Port.
 */
import { Result } from "../../../shared/domain/Result";
import { DomainError } from "../../../shared/domain/DomainError";
import { StickerId } from "../domain/StickerId";
import type { CatalogProductInfo } from "@/shared/contracts/CatalogPorts";

export type ProductInfo = CatalogProductInfo;

export interface CatalogGateway {
  getProductsInfo(stickerIds: StickerId[]): Promise<Result<ProductInfo[], DomainError>>;
  getProductInfo(stickerId: StickerId): Promise<Result<ProductInfo, DomainError>>;
}
