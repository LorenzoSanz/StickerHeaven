import { cn } from "@/lib/utils";

export function getFilterChevronClassName() {
  return cn(
    "h-7 w-7 rounded-full border border-white/10 bg-white/5 grid place-items-center text-white/60 transition-all group-open:rotate-180",
    "group-hover:border-primary/30 group-hover:bg-white/10 group-hover:text-white/80"
  );
}

export function getTagOptionButtonClassName({ active }: { active: boolean }) {
  return cn(
    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
    active
      ? "border-primary/40 bg-primary/15 text-white shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-primary/20 hover:border-primary/50"
      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-primary/30 hover:text-white/85"
  );
}

export function getSortOptionButtonClassName({ active }: { active: boolean }) {
  return cn(
    "w-full rounded-2xl border px-4 py-3 text-left transition-all",
    active
      ? "border-primary/40 bg-primary/15 shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-primary/20 hover:border-primary/50"
      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
  );
}
