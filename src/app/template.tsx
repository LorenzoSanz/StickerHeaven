"use client";

// POR QUÉ: Configuración de plantilla para Next.js.
// QUÉ: Proporciona una estructura común para todas las páginas de la web.

import { usePathname } from "next/navigation";
import { RouteTransitionOverlay } from "@/components/ui/RouteTransitionOverlay";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <RouteTransitionOverlay routeKey={pathname} minDurationMs={450} />
      <div key={pathname} className="page-transition">
        {children}
      </div>
    </>
  );
}
