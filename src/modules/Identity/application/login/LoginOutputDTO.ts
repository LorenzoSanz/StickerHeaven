
/**
 * POR QUÉ: Define el contrato de salida para el login de usuario.
 * INTEGRIDAD: Desacopla la capa de presentación de la entidad de dominio.
 * ESTRUCTURA: Capa Application - DTO.
 */

// DTO para la salida del login de usuario.
export interface LoginOutputDTO {
  sessionId: string;
  user: {
    id: string;
    email: string;
  };
}
