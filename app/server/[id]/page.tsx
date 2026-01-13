import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.server.findUnique({ where: { discordId: id } });
  if (!s || s.status !== "ACTIVE") return {};

  const title = `${s.name} | dcsunucu.com`;
  const description = (s.shortDesc || s.description || "Discord sunucusu")?.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: s.bannerUrl ? [s.bannerUrl] : s.avatarUrl ? [s.avatarUrl] : [],
    },
  };
}

export default async function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.server.findUnique({ where: { discordId: id } });
  if (!s || s.status !== "ACTIVE") return notFound();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(161,143,255,0.22), transparent 55%), radial-gradient(circle at 80% 20%, rgba(110,231,247,0.14), transparent 55%)",
      }} />

      <div className="relative max-w-5xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition mb-4">
          ← Geri dön
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
          {s.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.bannerUrl} alt="banner" className="h-56 w-full object-cover" />
          ) : (
            <div className="h-56 w-full bg-gradient-to-r from-[#5865F2]/25 to-[#a18fff]/20" />
          )}

          <div className="p-6 md:p-8">
            <div className="flex items-start gap-5">
              <div className="h-16 w-16 rounded-3xl bg-white/10 border border-white/10 overflow-hidden shrink-0">
                {s.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wide">{s.name}</h1>
                  {s.category && <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">{s.category}</span>}
                </div>
                <p className="mt-3 text-white/70">{s.shortDesc || s.description}</p>

                <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/70">
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">👥 {s.membersCount ?? "-"} üye</span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">🟢 {s.presenceCount ?? "-"} aktif</span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">🔊 {s.voiceCount ?? "-"} seste</span>
                  <span className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">🚀 {s.boostCount ?? "-"} boost</span>
                </div>
              </div>
              <a
                href={s.invite || undefined}
                target={s.invite ? "_blank" : undefined}
                rel={s.invite ? "noreferrer" : undefined}
                className={`shrink-0 px-5 py-3 rounded-2xl font-bold border transition ${
                  s.invite
                    ? "bg-gradient-to-r from-[#5865F2] to-[#a18fff] hover:from-[#4752c4] hover:to-[#7c5fff] border-white/10"
                    : "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
                }`}
              >
                Sunucuya Katıl
              </a>
            </div>

            {s.longDesc && (
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold">Açıklama</h2>
                <p className="mt-3 whitespace-pre-wrap text-white/70 leading-relaxed">{s.longDesc}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

