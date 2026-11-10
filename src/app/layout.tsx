import "@/styles/globals.css";
import type { Metadata } from "next";
import { env } from "@/config/env";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "StickerHeaven",
    template: "%s | StickerHeaven",
  },
  description: "El mejor lugar para comprar stickers",
  applicationName: "StickerHeaven",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "StickerHeaven",
    description: "El mejor lugar para comprar stickers",
    url: "/",
    siteName: "StickerHeaven",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StickerHeaven",
    description: "El mejor lugar para comprar stickers",
  },
  icons: {
    icon: "/assets/favicon.ico",
    shortcut: "/assets/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen text-foreground bg-background antialiased selection:bg-primary selection:text-white">
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
