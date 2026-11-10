import "@/styles/globals.css";
import type { Metadata } from "next";
import { connection } from "next/server";
import { publicEnv } from "@/config/publicEnv";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_APP_URL),
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The CSP nonce changes on every request, so pages must render per request, never at build time.
  await connection();
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
