/**
 * POR QUÉ: Implementación del patrón Publisher-Subscriber para eventos de dominio.
 * INTEGRIDAD: Desacopla publicadores de suscriptores, permitiendo flexibilidad y escalabilidad.
 * ESTRUCTURA: Infraestructura compartida.
 */
import { DomainEvent } from "../../domain/DomainEvent";
import { ILogger } from "../../domain/ILogger";
import { NullLogger } from "../logger/NullLogger";

// POR QUÉ: Interfaz para suscriptores de eventos de dominio.
export interface DomainEventSubscriber {
  on(event: DomainEvent): Promise<void>;
  subscribedTo(): string[]; //Devuelve la lista de nombres de eventos a los que el suscriptor está suscrito.
}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */

// POR QUÉ: Singleton para garantizar una única instancia del publicador de eventos.  
export class DomainEventPublisher {
  private subscribers: Map<string, DomainEventSubscriber[]> = new Map();
  private static instance: DomainEventPublisher;

  /**
   * POR QUÉ: Constructor privado para implementar el patrón Singleton.
   * INTEGRIDAD: Asegura que solo exista una única instancia del publicador de eventos.
   */
  private constructor(private logger: ILogger) {}

  public static getInstance(logger?: ILogger): DomainEventPublisher {
    if (!DomainEventPublisher.instance) {
      DomainEventPublisher.instance = new DomainEventPublisher(logger ?? new NullLogger());
    } else if (logger) {
      DomainEventPublisher.instance.logger = logger;
    }
    return DomainEventPublisher.instance;
  }

  /**
   * POR QUÉ: Registra un suscriptor para eventos específicos.
   * INTEGRIDAD: Asegura que solo se suscriban los eventos que el suscriptor está dispuesto a manejar.
   */
  public register(subscriber: DomainEventSubscriber): void {
    const eventNames = subscriber.subscribedTo();
    for (const eventName of eventNames) {
      if (!this.subscribers.has(eventName)) {
        this.subscribers.set(eventName, []);
      }
      this.subscribers.get(eventName)!.push(subscriber);
    }
  }

  /**
   * POR QUÉ: Publica eventos, notificando a todos los suscriptores suscritos a esos eventos.
   * INTEGRIDAD: Asegura que los eventos se publiquen en el orden en que se produjeron.
   */
  public async publish(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      const subscribers = this.subscribers.get(event.eventName);
      if (subscribers) {
        for (const subscriber of subscribers) {
          try {
            await subscriber.on(event);
          } catch (error) {
            // Registramos el error, pero no detenemos otros subscribers ni fallamos la transacción
            // Idealmente deberíamos tener un mecanismo de reintentos o una cola de mensajes muertos
            this.logger.error(`Error handling event ${event.eventName}:`, error);
          }
        }
      }
    }
  }
}
