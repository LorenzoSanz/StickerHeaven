import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/Card";

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-semibold text-white/80 hover:text-white">
            StickerHeaven
          </Link>
        </div>

        <Card>
          <CardHeader>
            <h1 className="text-center text-lg font-semibold text-foreground">{title}</h1>
            {description && <CardDescription className="text-center">{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        {footer ? <div className="mt-4 text-center text-sm text-white/70">{footer}</div> : null}
      </div>
    </div>
  );
}
