import { Entity } from "./Entity";
import { DomainEvent } from "./DomainEvent";
import { ValueObject, ValueObjectProps } from "./ValueObject";

export abstract class AggregateRoot<T, Id extends ValueObject<ValueObjectProps>> extends Entity<T, Id> {
  private _domainEvents: DomainEvent[] = [];
  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents.slice();
  }
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
  
  public pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents.slice();
    this.clearDomainEvents();
    return events;
  }
}
