/**
 * POR QUÉ: Utilidad para asegurar creación lazy y type-safe de singletons para DI.
 * INTEGRIDAD: Memoiza el resultado de la función factory.
 * ESTRUCTURA: Capa de infraestructura - DI.
 */

/**
 * POR QUÉ: Crea una función que devuelve una instancia única (singleton) cuando se invoca.
 * QUÉ: Utiliza memoización para garantizar que la instancia se cree solo la primera vez.
 * @param factory Función que crea la instancia.
 * @returns Función que devuelve la instancia única.
 */
export function createLazySingleton<T>(factory: () => T): () => T {
  let instance: T | null = null;
  return () => {
    if (!instance) {
      instance = factory();
    }
    return instance;
  };
}
/**
 * POR QUÉ: Se puede utilizar para crear singletons de servicios, repositorios o cualquier otra entidad que se necesite en toda la aplicación.
 * QUÉ: Asegura que solo se cree una instancia de la entidad y se reutilice en toda la aplicación.
 */
