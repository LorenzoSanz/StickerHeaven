// QUÉ: Configuración de página de carga para Next.js.
// POR QUÉ: Proporciona una página de carga personalizada para mejorar la experiencia del usuario.
import { PageLoader } from "@/components/ui/PageLoader";

export default function Loading() {
  return <PageLoader title="Cargando" subtitle="Preparando tu experiencia…" />;
}

