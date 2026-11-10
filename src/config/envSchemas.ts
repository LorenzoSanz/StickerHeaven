import { z } from "zod";

/**
 * Tipo de entorno (development, test, production) con valor por defecto "development".
 */
const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development");

/**
 * Tipo de valor booleano en cadena ("true" o "false") con valor por defecto "false".
 */
const truthyFalseySchema = z.union([z.literal("true"), z.literal("false")]).default("false");

/**
 * Tipo de moneda válida (3-10 caracteres alfanuméricos).
 */
const currencySchema = z
  .string()
  .trim()
  .min(3)
  .max(10);

  /**
   * Tipo de cadena requerida (sin espacios al inicio ni final).
   */
const requiredString = z.string().trim().min(1);

/**
 * Tipo de cadena opcional con espacios opcionales al inicio y final.
 */
const optionalTrimmedString = z.preprocess((v) => {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}, z.string().optional());

/**
 * Tipo de URL válida.
 */ 
const urlString = z.string().trim().url();

/**
 * Tipo de lista opcional de URLs separadas por comas, con espacios opcionales.
 */ 
const allowedOriginsSchema = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return undefined;
  const raw = v.trim();
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}, z.array(urlString).optional());

/**
 * Tipo de objeto de entorno con validación y transformación.
 */ 
export const envSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    NEXT_PUBLIC_APP_URL: urlString,
    ALLOWED_ORIGINS: allowedOriginsSchema,
    TRUST_PROXY: truthyFalseySchema,
    PORT: z.string().trim().regex(/^\d+$/),
    AUTH_SECRET: requiredString.min(32),
    DATABASE_URL: requiredString,
    CLOUDINARY_CLOUD_NAME: requiredString,
    CLOUDINARY_API_KEY: requiredString,
    CLOUDINARY_API_SECRET: requiredString,
    STRIPE_SECRET_KEY: requiredString,
    STRIPE_WEBHOOK_SECRET: requiredString,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredString,
    CURRENCY: currencySchema,
    EMAIL_PROVIDER: z.enum(["console", "smtp"]).optional().default("console"),
    SMTP_HOST: optionalTrimmedString,
    SMTP_PORT: z
      .preprocess((v) => (typeof v === "string" && v.trim().length ? Number(v) : undefined), z.number().int().positive().optional()),
    SMTP_FROM: optionalTrimmedString,
    SMTP_USER: optionalTrimmedString,
    SMTP_PASS: optionalTrimmedString,
    REDIS_URL: optionalTrimmedString,
  })
  // VALIDACIÓN CONDICIONAL: Requiere SMTP_HOST, SMTP_PORT, SMTP_FROM si EMAIL_PROVIDER=smtp.
  .superRefine((val, ctx) => {
    if (val.EMAIL_PROVIDER === "smtp") {
      if (!val.SMTP_HOST) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_HOST"], message: "Required when EMAIL_PROVIDER=smtp" });
      }
      if (!val.SMTP_PORT) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_PORT"], message: "Required when EMAIL_PROVIDER=smtp" });
      }
      if (!val.SMTP_FROM) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["SMTP_FROM"], message: "Required when EMAIL_PROVIDER=smtp" });
      }
    }
  });

/**
 * Tipo de objeto de entorno público con validación y transformación.
 */ 
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: urlString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredString,
});
