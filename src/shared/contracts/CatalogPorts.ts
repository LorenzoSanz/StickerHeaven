/**
 * POR QUÉ: Los módulos consumidores (Cart/Sales) necesitan consultar catálogo/stock sin importar detalles internos del módulo Catalog.
 * QUÉ: Define puertos de lectura y de stock del catálogo como contrato estable (Application layer) para interacción entre módulos.
 * LÍMITES: Este archivo no implementa nada; solo declara interfaces y DTOs de intercambio entre bounded contexts.
 */
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
  /**
   * POR QUÉ: Obtener información de un producto es fundamental para mostrar detalles en la tienda.
   * QUÉ: Expone una función para recuperar información detallada sobre un producto.
   * LÍMITES: No valida si el producto existe antes de intentar recuperarlo.
   */
  getProductInfo(id: string): Promise<Result<CatalogProductInfo, DomainError>>;
  /**
   * POR QUÉ: Obtener información de múltiples productos para mostrar catálogos completos.
   * QUÉ: Expone una función para recuperar información detallada sobre varios productos.
   * LÍMITES: No valida si los productos existen antes de intentar recuperarlos.
   */
  getProductsInfo(ids: string[]): Promise<Result<CatalogProductInfo[], DomainError>>;
}

/**
 * POR QUÉ: Reducir el stock de un producto para gestionar la disponibilidad en la tienda.
 * QUÉ: Expone una función para disminuir la cantidad disponible de un producto.
 * LÍMITES: No valida si el producto existe antes de intentar reducir su stock.
 */
export interface CatalogStockPort {
  reduceStock(id: string, quantity: number): Promise<Result<void, DomainError>>;
  /**
   * POR QUÉ: Restaurar el stock de un producto para la gestión de inventario.
   * QUÉ: Expone una función para aumentar la cantidad disponible de un producto.
   * LÍMITES: No valida si el producto existe antes de intentar restaurar su stock.
   */
  restoreStock(id: string, quantity: number): Promise<Result<void, DomainError>>;
}
