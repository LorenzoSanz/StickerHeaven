
import { ValueObject, ValueObjectProps } from "./ValueObject";
//
const isEntity = (v: unknown): v is Entity<unknown, ValueObject<ValueObjectProps>> => {
  return v instanceof Entity;
};

export abstract class Entity<T, Id extends ValueObject<ValueObjectProps>> {
  protected props: T;
  protected readonly _id: Id;

  constructor(props: T, id: Id) {
    this._id = id;
    this.props = props;
  }

  get id(): Id {
    return this._id;
  }

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
