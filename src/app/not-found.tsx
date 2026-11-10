
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
      </div>
      <Card className="relative z-10 max-w-xl w-full p-10 text-center">
        <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="mt-3 text-white/70">La página que buscas no existe o fue movida.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button>Ir al inicio</Button>
          </Link>
          <Link href="/stickers">
            <Button variant="outline">Ver catálogo</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
