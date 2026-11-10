/**
 * POR QUÉ: Proporciona una forma estándar de manejar errores de dominio sin lanzar excepciones.
 * INTEGRIDAD: Garantiza que los errores formen parte de la firma de tipos, obligando a gestionarlos.
 * ESTRUCTURA: Núcleo compartido - Used across all modules.
 */
export class DomainError {
  public readonly message: string;
  public name: string;

  constructor(message: string) {
    this.message = message;
    this.name = "DomainError";
  }
}
