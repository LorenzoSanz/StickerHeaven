/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import Link from "next/link";

/**
 * PROPÓSITO: API pública del módulo: ejecuta una acción con contrato explícito.
 */
export function FeaturesGrid() {
  return (
    <>
      {/* Features Grid */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Calidad premium",
              desc: "Vinilo grueso y resistente que protege tus stickers de arañazos, lluvia y sol.",
              icon: "✨",
            },
            {
              title: "Resistentes al agua",
              desc: "Resisten lavavajillas y el clima. Pégalos en tu botella o en el coche.",
              icon: "💧",
            },
            {
              title: "Hechos por la comunidad",
              desc: "Diseños de artistas independientes de todo el mundo. Apoya la creatividad.",
              icon: "🎨",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </span>
                  <h3 className="text-xl font-bold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
            COMPRA POR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-purple-500 animate-gradient">ESTILO</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Vida Dev", tag: "gaming", color: "from-blue-600/20 to-cyan-400/20", border: "border-cyan-500/30" },
            { name: "Anime", tag: "anime", color: "from-pink-500/20 to-rose-400/20", border: "border-pink-500/30" },
            { name: "Retro", tag: "retro", color: "from-orange-500/20 to-yellow-400/20", border: "border-orange-500/30" },
            { name: "Abstracto", tag: "art", color: "from-purple-600/20 to-indigo-400/20", border: "border-purple-500/30" },
          ].map((cat, i) => (
            <Link
              key={i}
              href={`/stickers?tags=${encodeURIComponent(cat.tag)}`}
              className={`group relative h-40 rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 border ${cat.border} hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} backdrop-blur-sm opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
