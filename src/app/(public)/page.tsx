import { ArtistSpotlight } from "@/components/home/ArtistSpotlight";
import { TrendingSlider } from "@/components/home/TrendingSlider";
import { HeroSection } from "@/components/home/HeroSection";
import { MarqueeStrip } from "@/components/home/MarqueeStrip";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";

// Página de Next.js para el segmento de navegación principal del usuario.
// Se fuerza la generación estática para mejorar el rendimiento.
// Eso implica que la página se renderice en build time y no en runtime y sus setbacks son:
// - No se puede acceder a datos dinámicos en tiempo de renderización.
// - No se puede acceder a datos del usuario en tiempo de renderización.
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 pb-20 overflow-x-hidden">
      <HeroSection />
      <MarqueeStrip />
      <FeaturesGrid />
      <TrendingSlider />
      <ArtistSpotlight />
      <TestimonialsSection />
      <NewsletterCTA />
    </div>
  );
}
