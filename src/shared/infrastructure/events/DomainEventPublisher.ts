import { DomainEvent } from "../../domain/DomainEvent";
import { ILogger } from "../../domain/ILogger";
import { NullLogger } from "../logger/NullLogger";

export interface DomainEventSubscriber {
  on(event: DomainEvent): Promise<void>;
  subscribedTo(): string[]; //Devuelve la lista de nombres de eventos a los que el suscriptor está suscrito.
}

export class DomainEventPublisher {
  private subscribers: Map<string, DomainEventSubscriber[]> = new Map();
  private static instance: DomainEventPublisher;

  private constructor(private logger: ILogger) {}

  public static getInstance(logger?: ILogger): DomainEventPublisher {
    if (!DomainEventPublisher.instance) {
      DomainEventPublisher.instance = new DomainEventPublisher(logger ?? new NullLogger());
    } else if (logger) {
      DomainEventPublisher.instance.logger = logger;
    }
    return DomainEventPublisher.instance;
  }

  public register(subscriber: DomainEventSubscriber): void {
    const eventNames = subscriber.subscribedTo();
    for (const eventName of eventNames) {
      if (!this.subscribers.has(eventName)) {
        this.subscribers.set(eventName, []);
      }
      this.subscribers.get(eventName)!.push(subscriber);
    }
  }

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
