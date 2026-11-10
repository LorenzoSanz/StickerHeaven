/**
 * POR QUÉ: Base class for Value Objects. VOs are defined by their attributes and are immutable.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Núcleo compartido - Used for Email, Password, Money, etc.
 */

/**
 * POR QUÉ: Define la estructura básica para Value Objects.
 * INTEGRIDAD: Asegura que los objetos de valor sean inmutables.
 */
export interface ValueObjectProps {}

/**
 * PROPÓSITO: API pública del módulo: encapsula comportamiento y dependencias.
 */
export abstract class ValueObject<T extends ValueObjectProps> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  /**
   * POR QUÉ: Compara si dos objetos de valor son iguales.
   * INTEGRIDAD: Asegura que la comparación se realice basada en la igualdad de sus propiedades.
   */ 
  public equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    if (vo.props === undefined) {
      return false;
    }
    return deepEqual(this.props, vo.props);
  }
}

// Esta funcion se dierencia de la anterior en que compara si los objetos de valor son iguales pero 
// teniendo en cuenta que los objetos de valor pueden contener otras instancias de objetos de valor.
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Si ninguno de los casos anteriores se cumple, se asume que los objetos no son iguales.
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;

  if (a instanceof ValueObject && b instanceof ValueObject) {
    return deepEqual((a as any).props, (b as any).props);
  }

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;

  const aKeys = Object.keys(aRecord).sort();
  const bKeys = Object.keys(bRecord).sort();
  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i += 1) {
    const key = aKeys[i];
    if (key !== bKeys[i]) return false;
    if (!deepEqual(aRecord[key], bRecord[key])) return false;
  }

  return true;
}
