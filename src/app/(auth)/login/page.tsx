import Link from "next/link";
import { AuthLayout } from "../_components/AuthLayout";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  return (
    <AuthLayout
      title="Iniciar sesión"
      description="Accede a tus pedidos, stickers y ajustes de cuenta."
      footer={
        <span>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-white hover:text-white/90">
            Créala aquí
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
