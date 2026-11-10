// PROPÓSITO: Extrae mensajes de error de Responses.
export async function readErrorMessage(res: Response): Promise<string> {
  const defaultMessage = `Request failed (${res.status})`;

  // PROPÓSITO: Intenta extraer mensajes de error de JSON.
  try {
    const data = (await res.clone().json()) as { error?: unknown; message?: unknown };
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
  } catch {
    // ignore
  }

  // PROPÓSITO: Intenta extraer mensajes de error de texto.
  try {
    const text = await res.clone().text();
    if (text.trim()) return text;
  } catch {
    // ignore
  }

  return defaultMessage;
}
