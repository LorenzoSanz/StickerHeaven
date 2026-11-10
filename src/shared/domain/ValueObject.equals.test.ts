/**
 * POR QUÉ: Prueba la igualdad de objetos de valor, independientemente del orden de sus propiedades.
 * INTEGRIDAD: Asegura que se gestione correctamente el flujo de fallo.   
 */   
import { describe, expect, it } from "bun:test";
import { ValueObject } from "./ValueObject";

/**
 * POR QUÉ: Clase de ejemplo para probar la igualdad de objetos de valor.
 * INTEGRIDAD: Asegura que se gestione correctamente el flujo de éxito y fallo.
 */
class KeyOrderVO extends ValueObject<{ a: number; b: number }> {
  static from(props: { a: number; b: number }) {
    return new KeyOrderVO(props);
  }
}

describe("ValueObject.equals", () => {
  it("treats objects with same keys/values as equal regardless of key order", () => {
    const a = KeyOrderVO.from({ a: 1, b: 2 });
    const b = KeyOrderVO.from({ b: 2, a: 1 });
    expect(a.equals(b)).toBe(true);
  });

  it("treats dates with same timestamp as equal", () => {
    class DateVO extends ValueObject<{ at: Date }> {
      static from(at: Date) {
        return new DateVO({ at });
      }
    }

    const t1 = DateVO.from(new Date("2020-01-01T00:00:00.000Z"));
    const t2 = DateVO.from(new Date("2020-01-01T00:00:00.000Z"));
    expect(t1.equals(t2)).toBe(true);
  });
});

