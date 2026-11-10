/**
 * El flujo de navegación (router.push/redirect) necesita notificaciones fiables tras cambiar de ruta.
 * Valida que flashNotify persiste y consume toasts sin reventar con storage inválido.
 */
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { flashNotify, consumeFlashNotifies } from "./flashNotify";
import { NotifyInput } from "./types";

function createSessionStorageStub() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    __store: store,
  };
}
// Describe el conjunto de pruebas para flashNotify.
describe("flashNotify", () => {
  const g = globalThis as unknown as { window?: any };
  const originalWindow = g.window;
  const sessionStorage = createSessionStorageStub();

  beforeEach(() => {
    sessionStorage.__store.clear();
    g.window = { sessionStorage };
  });

  afterEach(() => {
    g.window = originalWindow;
  });

  test("persists and consumes queued toasts", () => {
    const payload: NotifyInput = { variant: "success", title: "OK", message: "done" };
    flashNotify(payload);
    flashNotify({ variant: "danger", title: "NO", message: "fail" });

    const consumed = consumeFlashNotifies();
    expect(consumed).toEqual([payload, { variant: "danger", title: "NO", message: "fail" }]);
    expect(consumeFlashNotifies()).toEqual([]);
  });

  test("does not crash when storage contains invalid JSON", () => {
    sessionStorage.setItem("stickerheaven.flash_toasts.v1", "{invalid");
    expect(() => flashNotify({ variant: "info", title: "X" })).not.toThrow();
    expect(() => consumeFlashNotifies()).not.toThrow();
  });
});

