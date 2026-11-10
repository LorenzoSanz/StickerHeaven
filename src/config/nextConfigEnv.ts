export function getApiUrlForRewrites(): string {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  /**
   * Si API_URL está definida, la normaliza eliminando espacios en blanco.
   */
  const apiUrl = process.env.API_URL?.trim();
  if (apiUrl) return apiUrl;

  /**
   * Si NODE_ENV es "production", se lanza un error si API_URL no está definida.
   */
  if (nodeEnv === "production") {
    throw new Error("API_URL must be set in production");
  }

  /**
   * Si NODE_ENV no es "production", se devuelve el fallback local.
   */
  return "http://localhost:3001";
}
