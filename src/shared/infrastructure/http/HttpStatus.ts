/**
 * POR QUÉ: Errores HTTP Status Codes para evitar magic numbers.
 * INTEGRIDAD: Impone invariantes del valor.
 * ESTRUCTURA: Infraestructura compartida.
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  // POR QUÉ: Para cuando un endpoint requiere un Content-Type específico (e.g. multipart/form-data).
  UNSUPPORTED_MEDIA_TYPE = 415,
  // POR QUÉ: Para cuando no hay autenticación (e.g. no se ha iniciado sesión).
  UNAUTHORIZED = 401,
  // POR QUÉ: Para cuando hay autenticación pero no se tiene permiso (e.g. no es administrador).
  FORBIDDEN = 403,
  // POR QUÉ: Para cuando un recurso no se encuentra (e.g. sticker no existe).
  NOT_FOUND = 404,
  // POR QUÉ: Para cuando hay un conflicto (e.g. intentar crear un sticker con un ID que ya existe).
  CONFLICT = 409,
  // POR QUÉ: Para cuando se excede el límite de solicitudes (e.g. API rate limiting).
  TOO_MANY_REQUESTS = 429,
  // POR QUÉ: Para cuando hay un error en el servidor (e.g. falla en la base de datos).
  // INTEGRIDAD: Asegura que se devuelva un error genérico al cliente para no exponer detalles del servidor.
  INTERNAL_SERVER_ERROR = 500,
}
