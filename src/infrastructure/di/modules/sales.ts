import { createLazySingleton } from "../utils";
import { env } from "@/config/env";
import type { ILogger } from "@/shared/domain/ILogger";
import type { DomainEventPublisher } from "@/shared/infrastructure/events/DomainEventPublisher";
import type { IEmailService } from "@/shared/domain/IEmailService";
import type { UserContactQueryService } from "@/shared/contracts/UserContactQueryService";
import type { CatalogReadPort, CatalogStockPort } from "@/shared/contracts/CatalogPorts";
import type { CartReadPort, CartWritePort } from "@/shared/contracts/CartPorts";
import { MongoOrderRepository } from "@/modules/Sales/infrastructure/persistence/mongoose/MongoOrderRepository";
import { StripePaymentGateway } from "@/modules/Sales/infrastructure/gateways/StripePaymentGateway";
import { MongoSalesQueryService } from "@/modules/Sales/infrastructure/queries/MongoSalesQueryService";
import { SalesCatalogAdapter } from "@/infrastructure/adapters/sales/SalesCatalogAdapter";
import { SalesCartAdapter } from "@/infrastructure/adapters/sales/SalesCartAdapter";
import { CreateOrder } from "@/modules/Sales/application/create-order/CreateOrder";
import { CancelOrder } from "@/modules/Sales/application/cancel-order/CancelOrder";
import { ListOrders } from "@/modules/Sales/application/list-orders/ListOrders";
import { GetOrderById } from "@/modules/Sales/application/get-order/GetOrderById";
import { ConfirmPayment } from "@/modules/Sales/application/confirm-payment/ConfirmPayment";
import { Checkout } from "@/modules/Sales/application/checkout/Checkout";
import { OrderAccessPolicy } from "@/modules/Sales/application/policies/OrderAccessPolicy";
import { OrderReadAccessPolicy } from "@/modules/Sales/application/policies/OrderReadAccessPolicy";
import { OrderPaidSubscriber } from "@/modules/Sales/infrastructure/subscribers/OrderPaidSubscriber";
import { ClearCartOnOrderPaidSubscriber } from "@/modules/Sales/infrastructure/subscribers/ClearCartOnOrderPaidSubscriber";

// Proporciona servicios de ventas y controladores HTTP.
export function createSalesModule(deps: {
  logger: () => ILogger;
  eventPublisher: () => DomainEventPublisher;
  emailService: () => IEmailService;
  userContactQueryService: () => UserContactQueryService;
  catalogReadPort: () => CatalogReadPort;
  catalogStockPort: () => CatalogStockPort;
  cartReadPort: () => CartReadPort;
  cartWritePort: () => CartWritePort;
}) {
  const getOrderRepository = createLazySingleton(() => new MongoOrderRepository(deps.eventPublisher()));
  // POR QUÉ: Evitamos ramas de configuración implícitas; el gateway de pago debe ser Stripe en todos los entornos.
  // OBSERVABILIDAD: La app ya no puede arrancar sin STRIPE_SECRET_KEY válida.
  const getPaymentGateway = createLazySingleton(() => new StripePaymentGateway(env.STRIPE_SECRET_KEY));
  const getSalesQueryService = createLazySingleton(() => new MongoSalesQueryService());

  // Proporciona adaptadores para interactuar con el catálogo y el carrito de compras.
  const getSalesCatalogAdapter = createLazySingleton(() => new SalesCatalogAdapter(deps.catalogReadPort(), deps.catalogStockPort()));
  const getSalesCartAdapter = createLazySingleton(() => new SalesCartAdapter(deps.cartWritePort(), deps.cartReadPort()));
  const getOrderAccessPolicy = createLazySingleton(() => new OrderAccessPolicy());
  const getOrderReadAccessPolicy = createLazySingleton(() => new OrderReadAccessPolicy());

  // Proporciona servicios de creación y cancelación de pedidos.
  const createOrder = createLazySingleton(() =>
    new CreateOrder(getOrderRepository(), getSalesCatalogAdapter(), getPaymentGateway(), getSalesCartAdapter(), deps.logger())
  );

  // Proporciona servicios de creación y cancelación de pedidos.
  const useCases = {
    createOrder,
    cancelOrder: createLazySingleton(() =>
      new CancelOrder(getOrderRepository(), getPaymentGateway(), getSalesCatalogAdapter(), deps.logger(), getOrderAccessPolicy())
    ),
    listOrders: createLazySingleton(() => new ListOrders(getSalesQueryService())),
    getOrderById: createLazySingleton(() => new GetOrderById(getSalesQueryService(), getOrderReadAccessPolicy())),
    confirmPayment: createLazySingleton(() => new ConfirmPayment(getOrderRepository(), deps.logger())),
    checkout: createLazySingleton(() => new Checkout(getSalesCartAdapter(), createOrder())),
  };

  // Proporciona servicios de consulta sobre pedidos.
  const queries = {
    salesQueryService: getSalesQueryService,
  };

  // Proporciona suscriptores a eventos de dominio.
  const subscribers = {
    orderPaid: createLazySingleton(() =>
      new OrderPaidSubscriber(deps.emailService(), deps.userContactQueryService(), deps.logger())
    ),
    clearCartOnOrderPaid: createLazySingleton(() =>
      new ClearCartOnOrderPaidSubscriber(getSalesCartAdapter(), deps.logger())
    ),
  };

  // Este return se encarga de proporcionar servicios de ventas y controladores HTTP.
  return {
    useCases,
    queries,
    subscribers,
    gateways: {
      paymentGateway: getPaymentGateway,
    },
  };
}
