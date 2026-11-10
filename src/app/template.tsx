"use client";

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
