/**
 * PROPÓSITO: Unidad del proyecto con responsabilidad acotada por su ubicación y nombre.
 * RESPONSABILIDAD: Código de soporte del proyecto.
 * DEPENDENCIAS: Ver imports del archivo para dependencias explícitas.
 * SEGURIDAD/INTEGRIDAD: Mantiene invariantes explícitas cuando aplica.
 * NOTAS: Documentar aquí decisiones no obvias y tradeoffs relevantes.
 */
export function MarqueeStrip() {
  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 overflow-hidden py-4 relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
      <div className="flex w-max animate-marquee">
        {/* First set */}
        <div className="flex gap-12 whitespace-nowrap px-6 text-primary font-bold tracking-widest text-sm uppercase">
          <span>• Vinilo premium</span>
          <span>• Resistente al agua</span>
          <span>• Resistente a UV</span>
          <span>• Corte de precisión</span>
          <span>• Opción holográfica</span>
          <span>• Apoyo a artistas</span>
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex gap-12 whitespace-nowrap px-6 text-primary font-bold tracking-widest text-sm uppercase">
          <span>• Vinilo premium</span>
          <span>• Resistente al agua</span>
          <span>• Resistente a UV</span>
          <span>• Corte de precisión</span>
          <span>• Opción holográfica</span>
          <span>• Apoyo a artistas</span>
        </div>
        {/* Triplicate set for wide screens */}
        <div className="flex gap-12 whitespace-nowrap px-6 text-primary font-bold tracking-widest text-sm uppercase">
          <span>• Vinilo premium</span>
          <span>• Resistente al agua</span>
          <span>• Resistente a UV</span>
          <span>• Corte de precisión</span>
          <span>• Opción holográfica</span>
          <span>• Apoyo a artistas</span>
        </div>
      </div>
    </div>
  );
}
