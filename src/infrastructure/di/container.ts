/**
 * POR QUÉ: Contenedor central de inyección de dependencias para componer el monolito modular sin acoplar módulos entre sí.
 * QUÉ: Instancia módulos (domain/application) y conecta infraestructura (controllers, gateways, adapters, subscribers) con singletons lazy.
 * FLUJO: createApp → container.controllers.* → casos de uso → domain + ports → infraestructura (repos/Stripe/Cloudinary/Mongo).
 * LÍMITES: Este wiring no introduce reglas de negocio; solo conecta implementaciones con contratos.
 */

import { createLazySingleton } from "./utils";
import { env } from "@/config/env";
import { StickerController } from "@/modules/Catalog/infrastructure/http/StickerController";
import { SalesController } from "@/modules/Sales/infrastructure/http/SalesController";
import { StripeWebhookController } from "@/modules/Sales/infrastructure/http/StripeWebhookController";
import { StripePaymentGateway } from "@/modules/Sales/infrastructure/gateways/StripePaymentGateway";
import { CartMergeOnLoginAdapter } from "@/infrastructure/adapters/identity/CartMergeOnLoginAdapter";
import { IdentityController } from "@/modules/Identity/infrastructure/http/IdentityController";
import { CartController } from "@/modules/Cart/infrastructure/http/CartController";
import { createSharedModule } from "./modules/shared";
import { createCatalogModule } from "./modules/catalog";
import { createIdentityModule } from "./modules/identity";
import { createCartModule } from "./modules/cart";
import { createSalesModule } from "./modules/sales";
import { createMarketingModule } from "./modules/marketing";

// POR QUÉ: Módulos separados para encapsular lógica de negocio y conectar infraestructura.
// QUÉ: Cada módulo tiene casos de uso, puertos y adaptadores para interactuar con infraestructura.
const sharedModule = createSharedModule();
const catalogModule = createCatalogModule({ logger: sharedModule.logger });
const identityModule = createIdentityModule();
const cartModule = createCartModule({ catalogReadPort: catalogModule.ports.read, logger: sharedModule.logger });
const salesModule = createSalesModule({
  logger: sharedModule.logger,
  eventPublisher: sharedModule.eventPublisher,
  emailService: sharedModule.emailService,
  userContactQueryService: identityModule.queries.userContactQueryService,
  catalogReadPort: catalogModule.ports.read,
  catalogStockPort: catalogModule.ports.stock,
  cartReadPort: cartModule.ports.read,
  cartWritePort: cartModule.ports.write,
});
const marketingModule = createMarketingModule({ logger: sharedModule.logger, emailService: sharedModule.emailService });

const getCartMergeOnLoginAdapter = createLazySingleton(() => new CartMergeOnLoginAdapter(cartModule.useCases.mergeCarts(), sharedModule.logger()));

let subscribersRegistered = false;

export const registerSubscribers = (): void => {
  if (subscribersRegistered) return;
  sharedModule.eventPublisher().register(salesModule.subscribers.orderPaid());
  sharedModule.eventPublisher().register(salesModule.subscribers.clearCartOnOrderPaid());
  subscribersRegistered = true;
};

// ============================================================================
// CONTROLLERS
// ============================================================================

// POR QUÉ: Controladores HTTP para operaciones CRUD y transaccionales.
// QUÉ: Proporcionan endpoints HTTP para interactuar con la lógica de negocio.

const identityController = createLazySingleton(() => new IdentityController(
  identityModule.useCases.registerUser(),
  identityModule.useCases.loginUser(),
  identityModule.useCases.logoutUser(),
  identityModule.useCases.updateUserProfile(),
  identityModule.useCases.changePassword(),
  getCartMergeOnLoginAdapter(),
  identityModule.queries.sessionQueryService(),
  sharedModule.logger()
));

const stickerController = createLazySingleton(() => new StickerController(
  catalogModule.useCases.createStickerWithImage(),
  catalogModule.useCases.updateSticker(),
  catalogModule.useCases.updateStickerWithImage(),
  catalogModule.useCases.listStickers(),
  catalogModule.useCases.getStickerById(),
  catalogModule.useCases.deleteSticker(),
  catalogModule.queries.catalogQueryService(),
  sharedModule.logger()
));

const salesController = createLazySingleton(() => new SalesController(
  salesModule.useCases.createOrder(),
  salesModule.useCases.cancelOrder(),
  salesModule.useCases.listOrders(),
  salesModule.useCases.getOrderById(),
  salesModule.useCases.checkout(),
  sharedModule.logger()
));

const cartController = createLazySingleton(() => new CartController(
  cartModule.useCases.getCart(),
  cartModule.useCases.addItemToCart(),
  cartModule.useCases.updateCartItemQuantity(),
  cartModule.useCases.removeItemFromCart(),
  cartModule.useCases.clearCart(),
  sharedModule.logger()
));

// POR QUÉ: Evitamos ramas de configuración implícitas; la verificación de webhooks debe usar Stripe siempre y fallar si falta config.
// OBSERVABILIDAD: Si STRIPE_WEBHOOK_SECRET no está configurado, env.ts aborta en arranque y no se aceptan webhooks inseguros.
const stripeWebhookController = createLazySingleton(() => new StripeWebhookController(
  new StripePaymentGateway(env.STRIPE_SECRET_KEY),
  salesModule.useCases.confirmPayment(),
  sharedModule.logger(),
  env.STRIPE_WEBHOOK_SECRET
));

// ============================================================================
// GLOBAL CONTAINER
// ============================================================================

// POR QUÉ: Exportamos el container global para ser utilizado en toda la aplicación.
// QUÉ: Proporciona acceso a módulos compartidos, servicios y controladores.
// LÍMITES: No debe usarse para inyección de dependencias implícita; se prefiere inyección explícita.
// OBSERVABILIDAD: El container es el punto único de acceso a todos los componentes de la aplicación.
export const container = {
  shared: {
    logger: sharedModule.logger,
  },
  catalog: catalogModule,
  identity: identityModule,
  sales: salesModule,
  cart: cartModule,
  marketing: marketingModule,
  controllers: {
    identity: identityController,
    catalog: stickerController,
    sales: salesController,
    stripeWebhook: stripeWebhookController,
    cart: cartController,
    marketing: marketingModule.controllers.marketing,
  }
};
