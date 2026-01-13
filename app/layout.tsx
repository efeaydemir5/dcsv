import "./globals.css";

import UserMenu from "@/components/UserMenu";
import { Providers } from "./providers";
import Link from "next/link";
import { fontBody, fontDisplay } from "./ui/fonts";
import MouseGlow from "@/components/MouseGlow";

export const metadata = {
  title: "dcsunucu.com | Discord Sunucu Listesi",
  description: "Discord sunucunu ücretsiz tanıt ve keşfet. Türkiye'nin en iyi Discord sunucu listesi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${fontBody.variable} ${fontDisplay.variable} bg-[#070913] text-white antialiased`}>
        <Providers>
          <MouseGlow />
          <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#070913]/60 backdrop-blur-xl">
            <div className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
              <Link href="/" className="font-[var(--font-display)] font-bold text-xl tracking-wider">
                dcsunucu.com
              </Link>
            <div className="flex items-center gap-4">
              <Link href="/add-server" className="text-white/80 hover:text-white transition">Sunucu Ekle</Link>
              <Link href="/my-servers" className="text-white/80 hover:text-white transition">Sunucularım</Link>
              <UserMenu />
            </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
