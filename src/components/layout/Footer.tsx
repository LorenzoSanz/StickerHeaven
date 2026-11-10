import Link from "next/link";
import { NewsletterSubscribeForm } from "@/components/newsletter/NewsletterSubscribeForm";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StickerHeaven
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Stickers premium para desarrolladores, diseñadores y creativos.
              Dale un toque único a tu equipo con vinilo duradero y de alta calidad.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Tienda</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/stickers" className="hover:text-primary transition-colors">Todos los stickers</Link></li>
              <li><Link href="/cart" className="hover:text-primary transition-colors">Carrito</Link></li>
              <li><Link href="/checkout" className="hover:text-primary transition-colors">Pago</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="font-semibold text-white mb-4">Cuenta</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Panel</Link></li>
              <li><Link href="/dashboard/profile" className="hover:text-primary transition-colors">Ajustes de cuenta</Link></li>
              <li><Link href="/dashboard/stickers" className="hover:text-primary transition-colors">Mis stickers</Link></li>
              <li><Link href="/dashboard/stickers/new" className="hover:text-primary transition-colors">Subir sticker</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="font-semibold text-white mb-4">Mantente al día</h3>
            <p className="text-sm text-gray-400 mb-4">Suscríbete para recibir ofertas especiales, sorteos y promociones únicas.</p>
            <NewsletterSubscribeForm
              formClassName="flex flex-col gap-2"
              inputClassName="bg-background border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-70"
              buttonClassName="bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="Tu email"
              buttonLabel="Suscribirme"
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} StickerHeaven. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
