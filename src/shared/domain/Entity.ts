/**
 * POR QUÉ: Base class for Domain Entities. Entities are defined by their identity, not their attributes.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Núcleo compartido - Fundamental building block of DDD.
 */

import { ValueObject, ValueObjectProps } from "./ValueObject";
//
/**
 * POR QUÉ: Verifica si un objeto es una instancia de Entity.
 * INTEGRIDAD: Asegura que se verifique correctamente la identidad de la entidad.
 */
const isEntity = (v: unknown): v is Entity<unknown, ValueObject<ValueObjectProps>> => {
  return v instanceof Entity;
};

/**
 * POR QUÉ: Encapsula la identidad única de una entidad.
 * INTEGRIDAD: Asegura que se gestione correctamente la identidad única de cada entidad.
 */ 
/**
 * POR QUÉ: API pública del módulo: encapsula comportamiento y dependencias.
 * INTEGRIDAD: Asegura que se gestione correctamente el flujo de éxito y fallo.
 */
export abstract class Entity<T, Id extends ValueObject<ValueObjectProps>> {
  protected props: T;
  protected readonly _id: Id;

  constructor(props: T, id: Id) {
    this._id = id;
    this.props = props;
  }

  /**
   * POR QUÉ: Devuelve la identidad única de la entidad.
   * INTEGRIDAD: Asegura que se acceda correctamente a la identidad única de la entidad.
   */
  get id(): Id {
    return this._id;
  }

  /**
   * POR QUÉ: Compara si dos entidades son iguales.
   * INTEGRIDAD: Asegura que la comparación se realice basada en la igualdad de sus identidades únicas.
   */
  public equals(object?: Entity<T, Id>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
