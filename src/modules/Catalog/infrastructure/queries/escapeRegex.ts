// User text goes into MongoDB $regex; escaping makes it a literal match and prevents
// catastrophic patterns such as (a+)+$ from tying up the database (ReDoS).
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
