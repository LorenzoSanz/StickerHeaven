"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const AVAILABLE_TAGS = [
  "anime",
  "cute",
  "kawaii",
  "meme",
  "gaming",
  "retro",
  "minimal",
  "nature",
  "animals",
  "music",
  "sports",
  "art",
  "travel",
  "food",
].sort((a, b) => a.localeCompare(b));

interface TagSelectorProps {
  initialTags?: string[];
}

export function TagSelector({ initialTags = [] }: TagSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialTags);

  const toggleTag = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-3">
      {/* Input oculto para que el formulario nativo (FormData) capture los tags separados por comas */}
      <input type="hidden" name="tags" value={selected.join(",")} />
      
      <div className="flex flex-wrap gap-2 justify-center">
        {AVAILABLE_TAGS.map((tag) => {
          const isActive = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all select-none",
                isActive
                  ? "border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10"
              )}
            >
              {isActive && <Check className="h-3 w-3 animate-fade-in" />}
              {tag}
            </button>
          );
        })}
      </div>
      
      {selected.length === 0 && (
        <p className="text-[10px] text-white/30 italic text-center">
          Selecciona al menos una categoría para mejorar la visibilidad.
        </p>
      )}
    </div>
  );
}
