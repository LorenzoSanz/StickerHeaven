/**
 * POR QUÉ: Base interface para todos los Domain Events.
 * INTEGRIDAD: Garantiza que todos los eventos incluyan el momento en el que ocurrieron y un ID único.
 * ESTRUCTURA: Núcleo compartido.
 */
export interface DomainEvent {
  occurredOn: Date;
  eventId: string;
  eventName: string;
}
