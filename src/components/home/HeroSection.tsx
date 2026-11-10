import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full mix-blend-screen animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          Pega lo que
          <br />
          <span className="bg-gradient-to-r from-primary via-accent to-purple-500 bg-clip-text text-transparent animate-gradient bg-300%">
            más te gusta
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
          Stickers de vinilo premium para desarrolladores, diseñadores y creadores.
          Exprésate con nuestras colecciones exclusivas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-fit mx-auto">
          <Link
            href="/stickers"
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]"
          >
            Comprar ahora
          </Link>
          <Link
            href="/stickers?sort=newest"
            className="px-8 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-full font-semibold text-lg transition-all border border-transparent hover:border-white/10"
          >
            Ver novedades
          </Link>
        </div>
      </div>
    </section>
  );
}
