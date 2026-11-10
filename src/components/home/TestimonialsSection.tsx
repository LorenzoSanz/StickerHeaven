export function TestimonialsSection() {
  return (
    <section className="container mx-auto px-4 py-20 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
        Favorito de{" "}
        <span className="inline-block bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent pb-2">
          desarrolladores y creadores
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          {
            text: "La calidad es brutal. Los puse en mi tabla y no se han despegado nada después de toda la temporada.",
            author: "Sarah J.",
            role: "Diseñadora UX",
            color: "bg-pink-500",
          },
          {
            text: "Envío rápido y el packaging era tan guay que casi no quería abrirlo. La mejor tienda de stickers, sin duda.",
            author: "Mike T.",
            role: "Dev Frontend",
            color: "bg-blue-500",
          },
          {
            text: "Por fin stickers que se pegan de verdad a mi funda con textura. Los holográficos son hipnóticos.",
            author: "Davina R.",
            role: "Artista digital",
            color: "bg-purple-500",
          },
        ].map((t, i) => (
          <div
            key={i}
            className={`p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-2 backdrop-blur-md relative overflow-hidden group ${
              i === 1 ? "md:-mt-8" : ""
            }`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl font-serif leading-none group-hover:text-primary transition-colors">
              &quot;
            </div>

            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-lg">
                  ★
                </span>
              ))}
            </div>

            <p className="text-gray-300 mb-8 leading-relaxed relative z-10">
              &quot;{t.text}&quot;
            </p>

            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20 ring-offset-2 ring-offset-black`}
              >
                {t.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-white">{t.author}</p>
                <p className="text-xs text-primary">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
