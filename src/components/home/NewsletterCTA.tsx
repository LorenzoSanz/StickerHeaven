/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
import { NewsletterSubscribeForm } from "@/components/newsletter/NewsletterSubscribeForm";

export function NewsletterCTA() {
  return (
    <section className="container mx-auto px-4">
      <div className="rounded-3xl bg-gradient-to-r from-secondary to-primary p-12 text-center relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: "url('/assets/patterns/cubes.png')" }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Únete a la revolución sticker
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Recibe lanzamientos exclusivos, entrevistas y un 10% de descuento en tu primera compra
            al suscribirte.
          </p>
          <NewsletterSubscribeForm
            formClassName="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            inputClassName="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            buttonClassName="px-8 py-3 bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </section>
  );
}
