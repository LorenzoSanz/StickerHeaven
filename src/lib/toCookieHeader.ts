// PROPÓSITO: Convierte un array de cookies en una cadena de encabezado para ser enviada en una solicitud HTTP.
export function toCookieHeader(all: Array<{ name: string; value: string }>): string {
  return all.map((c) => `${c.name}=${c.value}`).join("; ");
}

