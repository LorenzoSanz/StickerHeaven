type TestEnvOverrides = Partial<Record<string, string>>;

const defaultTestEnv: Record<string, string> = {
  NODE_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  ALLOWED_ORIGINS: "http://localhost:3000",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_x",
  AUTH_SECRET: "x".repeat(32),
  DATABASE_URL: "mongodb://localhost:27017/test",
  CLOUDINARY_CLOUD_NAME: "cloud",
  CLOUDINARY_API_KEY: "key",
  CLOUDINARY_API_SECRET: "secret",
  STRIPE_SECRET_KEY: "sk_test_x",
  STRIPE_WEBHOOK_SECRET: "whsec_test_x",
  CURRENCY: "EUR",
  PORT: "3001",
};

/**
 * Aplica las variables de entorno de prueba al entorno actual.
 * @param overrides - Opciones de sobrescritura para las variables de entorno de prueba.
 */
export function applyTestEnv(overrides: TestEnvOverrides = {}): void {
  Object.assign(process.env, defaultTestEnv, overrides);
}
