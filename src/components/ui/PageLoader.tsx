import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
// Componente para mostrar un loader de página con un mensaje y opcionalmente un subtítulo.
// Utiliza un diseño centrado con un spinner animado y efectos de desenfoque.
export function PageLoader({
  title = "Cargando…",
  subtitle,
  className,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-[60vh] w-full overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-10%] right-[-5%] h-[520px] w-[520px] rounded-full bg-primary/20 blur-[140px] opacity-35" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[520px] w-[520px] rounded-full bg-accent/20 blur-[140px] opacity-30" />
      </div>

      <div className="relative z-10 flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface/90 p-8 text-center shadow-[0_0_60px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Spinner size="lg" />
          </div>
          <div className="text-lg font-semibold text-foreground">{title}</div>
          {subtitle ? <div className="mt-2 text-sm text-white/60">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}

