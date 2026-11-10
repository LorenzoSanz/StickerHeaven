import { ArtistSpotlight } from "@/components/home/ArtistSpotlight";
import { TrendingSlider } from "@/components/home/TrendingSlider";
import { HeroSection } from "@/components/home/HeroSection";
import { MarqueeStrip } from "@/components/home/MarqueeStrip";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterCTA } from "@/components/home/NewsletterCTA";


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
