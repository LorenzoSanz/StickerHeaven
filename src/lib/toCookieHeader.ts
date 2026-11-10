export function toCookieHeader(all: Array<{ name: string; value: string }>): string {
  return all.map((c) => `${c.name}=${c.value}`).join("; ");
}

