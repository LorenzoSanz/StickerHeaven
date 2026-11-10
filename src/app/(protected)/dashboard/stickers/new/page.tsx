/**
 * PROPÓSITO: Página protegida para crear Stickers de forma profesional (fuente de verdad: dominio).
 * RESPONSABILIDAD: Renderiza el formulario y navega al catálogo tras creación.
 * DEPENDENCIAS: UI Next.js + endpoint protegido POST /api/stickers.
 * SEGURIDAD/INTEGRIDAD: Requiere sesión (cookies HttpOnly); no crea stickers desde Cloudinary directamente.
 * NOTAS: Útil para dev/admin; si se introduce rol admin real, esta ruta debería restringirse por rol.
 */
import Link from "next/link";
import { CreateStickerForm } from "./CreateStickerForm";
import { DashboardShell } from "../../_components/DashboardShell";
import { Card } from "@/components/ui/Card";

// Página para crear un nuevo sticker.
export default function NewStickerPage() {
  return (
    <DashboardShell
      title="Crear sticker"
      description="Sube un nuevo sticker a tu catálogo."
      action={
        <div className="flex items-center gap-3">
          <Link href="/dashboard/stickers" className="text-sm font-semibold text-white/80 hover:text-white">
            Mis stickers
          </Link>
          <Link href="/stickers" className="text-sm font-semibold text-white/80 hover:text-white">
            Catálogo público
          </Link>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <CreateStickerForm />
        </Card>
      </div>
    </DashboardShell>
  );
}
