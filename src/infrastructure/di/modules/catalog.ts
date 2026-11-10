import { createLazySingleton } from "../utils";
import { MongoStickerRepository } from "@/modules/Catalog/infrastructure/persistence/mongoose/MongoStickerRepository";
import { MongoCatalogQueryService } from "@/modules/Catalog/infrastructure/queries/MongoCatalogQueryService";
import { ListStickers } from "@/modules/Catalog/application/list/ListStickers";
import { GetStickerById } from "@/modules/Catalog/application/get-by-id/GetStickerById";
import { GetStickersByIds } from "@/modules/Catalog/application/get-by-ids/GetStickersByIds";
import { ReduceStickerStock } from "@/modules/Catalog/application/reduce-stock/ReduceStickerStock";
import { RestoreStickerStock } from "@/modules/Catalog/application/restore-stock/RestoreStickerStock";
import { CreateSticker } from "@/modules/Catalog/application/create/CreateSticker";
import { CreateStickerWithImage } from "@/modules/Catalog/application/create-with-image/CreateStickerWithImage";
import { UpdateSticker } from "@/modules/Catalog/application/update/UpdateSticker";
import { UpdateStickerWithImage } from "@/modules/Catalog/application/update-with-image/UpdateStickerWithImage";
import { DeleteSticker } from "@/modules/Catalog/application/delete/DeleteSticker";
import { StickerOwnerAssignmentPolicy } from "@/modules/Catalog/application/policies/StickerOwnerAssignmentPolicy";
import { StickerOwnershipPolicy } from "@/modules/Catalog/application/policies/StickerOwnershipPolicy";
import { CloudinaryImageStorageService } from "@/modules/Catalog/infrastructure/services/CloudinaryImageStorageService";
import type { ILogger } from "@/shared/domain/ILogger";
import { CatalogReadPort, CatalogStockPort } from "@/shared/contracts/CatalogPorts";
import { Quantity } from "@/shared/domain/Quantity";
import { Result } from "@/shared/domain/Result";

// Proporciona servicios de consulta sobre el catálogo de stickers.
export function createCatalogModule(deps: { logger: () => ILogger }) {
  const getStickerRepository = createLazySingleton(() => new MongoStickerRepository());
  const getCatalogQueryService = createLazySingleton(() => new MongoCatalogQueryService());

  const getImageStorageService = createLazySingleton(() => new CloudinaryImageStorageService(deps.logger()));
  const getStickerOwnerAssignmentPolicy = createLazySingleton(() => new StickerOwnerAssignmentPolicy());
  const getStickerOwnershipPolicy = createLazySingleton(() => new StickerOwnershipPolicy());
  
  // Proporciona servicios de escritura sobre el catálogo de stickers.
  const useCases = {
    listStickers: createLazySingleton(() => new ListStickers(getCatalogQueryService())),
    getStickerById: createLazySingleton(() => new GetStickerById(getCatalogQueryService())),
    getStickersByIds: createLazySingleton(() => new GetStickersByIds(getStickerRepository())),
    createSticker: createLazySingleton(() => new CreateSticker(getStickerRepository(), getStickerOwnerAssignmentPolicy())),
    createStickerWithImage: createLazySingleton(() =>
      new CreateStickerWithImage(getStickerRepository(), getImageStorageService(), getStickerOwnerAssignmentPolicy())
    ),
    updateSticker: createLazySingleton(() => new UpdateSticker(getStickerRepository(), getStickerOwnershipPolicy())),
    updateStickerWithImage: createLazySingleton(() =>
      new UpdateStickerWithImage(getStickerRepository(), getImageStorageService(), getStickerOwnershipPolicy())
    ),
    deleteSticker: createLazySingleton(() => new DeleteSticker(getStickerRepository(), getStickerOwnershipPolicy())),
    reduceStickerStock: createLazySingleton(() => new ReduceStickerStock(getStickerRepository())),
    restoreStickerStock: createLazySingleton(() => new RestoreStickerStock(getStickerRepository())),
  };
  
  // Proporciona servicios de consulta sobre el catálogo de stickers.
  const queries = {
    catalogQueryService: getCatalogQueryService,
  };

  // Proporciona servicios de almacenamiento de imágenes sobre el catálogo de stickers.
  const services = {
    imageStorage: getImageStorageService,
  };
  
  // Proporciona puertos de entrada/salida para interactuar con el catálogo de stickers.
  const catalogReadPort = createLazySingleton<CatalogReadPort>(() => ({
    getProductInfo: async (id) => {
      const result = await useCases.getStickerById().execute(id);
      if (result.isFailure) return Result.fail(result.error!);
      const dto = result.getValue();
      return Result.ok({
        id: dto.id,
        name: dto.name,
        imageUrl: dto.imageUrl,
        priceAmount: dto.price.amount,
        priceCurrency: dto.price.currency,
        stock: dto.stock,
      });
    },
    getProductsInfo: async (ids) => {
      const result = await useCases.getStickersByIds().execute(ids);
      if (result.isFailure) return Result.fail(result.error!);
      const dtos = result.getValue();
      return Result.ok(
        dtos.map((dto) => ({
          id: dto.id,
          name: dto.name,
          imageUrl: dto.imageUrl,
          priceAmount: dto.price.amount,
          priceCurrency: dto.price.currency,
          stock: dto.stock,
        }))
      );
    },
  }));
  
  // Proporciona puertos de entrada/salida para interactuar con el catálogo de stickers.
  const catalogStockPort = createLazySingleton<CatalogStockPort>(() => ({
    reduceStock: async (id, quantity) => {
      const q = Quantity.create(quantity);
      if (q.isFailure) return Result.fail(q.error!);
      return await useCases.reduceStickerStock().execute({ id, quantity: q.getValue() });
    },
    restoreStock: async (id, quantity) => {
      const q = Quantity.create(quantity);
      if (q.isFailure) return Result.fail(q.error!);
      return await useCases.restoreStickerStock().execute({ id, quantity: q.getValue() });
    },
  }));
  
  // Proporciona puertos de entrada/salida para interactuar con el catálogo de stickers.
  const ports = {
    read: catalogReadPort,
    stock: catalogStockPort,
  };

  // Proporciona puertos de entrada/salida para interactuar con el catálogo de stickers.
  return {
    useCases,
    queries,
    services,
    ports,
  };
}
