/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ARTIST_IMAGES = [
  "/assets/test-images/Stickers/sticker10.png", // Main/Default
  "/assets/test-images/Stickers/sticker11.png",
  "/assets/test-images/Stickers/sticker12.png",
  "/assets/test-images/Stickers/sticker13.png",
];

/**
 * PROPÓSITO: API pública del módulo: ejecuta una acción con contrato explícito.
 */
export function ArtistSpotlight() {
  const [activeImage, setActiveImage] = useState(ARTIST_IMAGES[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleImageChange = (src: string) => {
    if (src === activeImage || isAnimating) return;
    
    setIsAnimating(true);
    
    // Wait for fade out, then swap image and fade in
    setTimeout(() => {
      setActiveImage(src);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <section className="container mx-auto px-4">
      <div className="rounded-3xl bg-surface border border-white/5 overflow-hidden flex flex-col md:flex-row h-auto md:h-[600px]">
        {/* Info Column */}
        <div className="md:w-1/2 bg-gradient-to-br from-gray-900 to-black p-12 flex flex-col justify-center relative z-20">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-4 w-fit">
            DESTACADO DE LA SEMANA
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Spotlight de stickers
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
            Descubre novedades y favoritos de la comunidad. Esta sección destaca una selección
            rotativa del catálogo mientras construimos páginas de creadores y colecciones.
          </p>
          <Link
            href="/stickers"
            className="text-white font-semibold hover:text-primary transition-colors flex items-center gap-2"
          >
            Ver catálogo &rarr;
          </Link>
        </div>

        {/* Interactive Image Column */}
        <div className="md:w-1/2 relative min-h-[500px] md:min-h-full bg-black/50 overflow-hidden group">
          {/* Ambient Blurred Background (fills the space) */}
          <div className={`absolute inset-0 z-0 transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
             <Image
               src={activeImage}
               alt="Fondo ambiental"
               fill
               className="object-cover blur-[60px] opacity-60 scale-110 transition-all duration-700"
             />
             <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Floating Glass Card Container */}
          <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
             <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl transition-transform duration-500 hover:scale-[1.02] hover:rotate-1">
                {/* Glossy Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 rounded-2xl pointer-events-none" />
                
                {/* Main Artwork */}
                <div className={`relative w-full h-full p-6 transition-opacity duration-300 ease-in-out ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <Image
                        src={activeImage}
                        alt="Sticker destacado"
                        fill
                        className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        priority
                    />
                </div>
             </div>
          </div>

          {/* Floating Dock Selector */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30 p-3 rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 shadow-lg translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            {ARTIST_IMAGES.map((src, i) => (
              <button
                key={i}
                onClick={() => handleImageChange(src)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  activeImage === src
                    ? "border-primary scale-110 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                    : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
                }`}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`Miniatura ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          
          {/* Mobile Dock (Bottom) - Visible only on mobile */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 md:hidden p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            {ARTIST_IMAGES.map((src, i) => (
              <button
                key={i}
                onClick={() => handleImageChange(src)}
                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  activeImage === src
                    ? "border-primary scale-110"
                    : "border-transparent opacity-70"
                }`}
              >
                <Image src={src} alt="miniatura" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
