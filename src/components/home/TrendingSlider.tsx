"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Mock data for 8 trending items
const TRENDING_ITEMS = [
  { id: 1, src: "/assets/test-images/Stickers/sticker1.jpg", name: "Gato cósmico", price: "4,99 €" },
  { id: 2, src: "/assets/test-images/Stickers/sticker2.jpg", name: "Vibra retro", price: "3,99 €" },
  { id: 3, src: "/assets/test-images/Stickers/sticker3.jpg", name: "Ciudad neón", price: "5,99 €" },
  { id: 4, src: "/assets/test-images/Stickers/sticker4.png", name: "Calavera holo", price: "6,99 €" },
  { id: 5, src: "/assets/test-images/Stickers/sticker5.jpg", name: "Ciberpunk", price: "4,99 €" },
  { id: 6, src: "/assets/test-images/Stickers/sticker6.png", name: "Corazón pixel", price: "3,50 €" },
  { id: 7, src: "/assets/test-images/Stickers/sticker7.png", name: "Fantasma glitch", price: "5,50 €" },
  { id: 8, src: "/assets/test-images/Stickers/sticker8.png", name: "Vaporwave", price: "4,50 €" },
];

export function TrendingSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 4 >= TRENDING_ITEMS.length ? 0 : prev + 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 4 < 0 ? TRENDING_ITEMS.length - 4 : prev - 4));
  };

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
            PARA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-500 animate-gradient">INSPIRARTE</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full" />
          <p className="text-gray-400 mt-4 max-w-lg">
            Una selección para descubrir ideas y empezar a crear tu colección.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={prevSlide}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:border-primary flex items-center justify-center transition-all active:scale-95 group"
            aria-label="Anteriores"
          >
            <span className="text-xl text-white group-hover:-translate-x-0.5 transition-transform flex items-center justify-center w-full h-full pb-1">&larr;</span>
          </button>
          <button 
            onClick={nextSlide}
            className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-primary hover:border-primary flex items-center justify-center transition-all active:scale-95 group"
            aria-label="Siguientes"
          >
            <span className="text-xl text-white group-hover:translate-x-0.5 transition-transform flex items-center justify-center w-full h-full pb-1">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Slider Grid - Sliding Track */}
      <div className="relative overflow-x-hidden overflow-y-visible min-h-[400px] py-4">
        {/* Track */}
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${(currentIndex / TRENDING_ITEMS.length) * 100}%)` }}
        >
          {TRENDING_ITEMS.map((sticker) => (
            <div 
              key={sticker.id} 
              className="w-full sm:w-1/2 md:w-1/4 flex-shrink-0 px-3"
            >
              <div className="group relative aspect-[4/5] rounded-2xl bg-surface border border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 h-full hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-2">
                
                {/* Modern Texture Overlay on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 mix-blend-overlay pointer-events-none z-0" 
                  style={{ backgroundImage: "url('/assets/patterns/cubes.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

                {/* Image */}
                <div className="absolute inset-0 p-6 flex items-center justify-center bg-gradient-to-b from-transparent to-black/20 z-10">
                  <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Image
                      src={sticker.src}
                      alt={sticker.name}
                      fill
                      className="object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
                
                {/* Overlay Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <h3 className="text-xl font-bold text-white mb-1">{sticker.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{sticker.price}</span>
                    <Link
                      href="/stickers?sort=newest"
                      className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                    >
                      VER CATÁLOGO
                    </Link>
                  </div>
                </div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-accent/20 backdrop-blur-md border border-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-20">
                  Top
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile "View All" Link */}
      <div className="mt-8 text-center md:hidden">
        <Link href="/stickers?sort=newest" className="text-primary hover:text-accent transition-colors font-semibold">
          Ver novedades &rarr;
        </Link>
      </div>
    </section>
  );
}
