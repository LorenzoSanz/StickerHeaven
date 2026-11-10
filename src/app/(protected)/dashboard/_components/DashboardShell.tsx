import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100dvh-96px)]">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[520px] h-[520px] bg-primary/18 rounded-full blur-[140px] opacity-35" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[520px] h-[520px] bg-accent/18 rounded-full blur-[140px] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al panel
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description ? <p className="mt-2 text-white/60">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
