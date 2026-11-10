/**
 * POR QUÉ: Clase base para Aggregate Roots. Los agregados son los límites de consistencia.
 * INTEGRIDAD: Gestiona Domain Events para asegurar que los efectos colaterales se capturan pero quedan desacoplados.
 * ESTRUCTURA: Núcleo compartido.
 */
import { Entity } from "./Entity";
import { DomainEvent } from "./DomainEvent";
import { ValueObject, ValueObjectProps } from "./ValueObject";

/**
 * POR QUÉ: API pública del módulo: encapsula comportamiento y dependencias.
 * INTEGRIDAD: Asegura que se gestione correctamente el flujo de éxito y fallo.
 */


export abstract class AggregateRoot<T, Id extends ValueObject<ValueObjectProps>> extends Entity<T, Id> {
  /**
   * POR QUÉ: Almacena eventos de dominio para ser capturados por el AggregateRoot.
   * INTEGRIDAD: Asegura que los eventos se capturen y se puedan reenviar después.
   */ 
  private _domainEvents: DomainEvent[] = [];
  /**
   * POR QUÉ: Retorna eventos de dominio capturados.
   * INTEGRIDAD: Asegura que se devuelvan eventos capturados y no se modifiquen.
   */
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents.slice();
  }
  /**
   * POR QUÉ: Añade un evento de dominio al AggregateRoot.
   * INTEGRIDAD: Asegura que el evento se capture y se pueda reenviar después.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * POR QUÉ: Limpia eventos de dominio capturados.
   * INTEGRIDAD: Asegura que no se modifiquen eventos capturados.
   */ 
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
  
  /**
   * POR QUÉ: Retorna y limpia eventos de dominio capturados.
   * INTEGRIDAD: Asegura que se devuelvan eventos capturados y se limpie la lista.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents.slice();
    this.clearDomainEvents();
    return events;
  }
}
