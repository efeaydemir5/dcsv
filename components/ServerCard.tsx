import Image from "next/image";

type Props = {
  server: {
    id: string;
    discordId?: string;
    name: string;
    description?: string | null;
    invite?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
    isFeatured?: boolean;
    membersCount?: number | null;
    presenceCount?: number | null;
    voiceCount?: number | null;
    boostCount?: number | null;
    category?: string | null;
  };
};

export default function ServerCard({ server }: Props) {
  const href = server.discordId ? `/server/${server.discordId}` : undefined;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/0 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] h-full min-h-[420px] max-h-[420px]">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-24 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_30%_20%,rgba(161,143,255,0.25),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(110,231,247,0.18),transparent_55%)]" />

      {/* banner */}
      <div className="relative h-28 md:h-32 bg-white/5 border-b border-white/10 flex items-end justify-center">
          {server.bannerUrl ? (
            server.bannerUrl.endsWith('.gif') ? (
              <img
                src={server.bannerUrl}
                alt="banner"
                className="h-full w-full object-cover opacity-90"
                style={{ zIndex: 1 }}
              />
            ) : (
              <Image
                src={server.bannerUrl}
                alt="banner"
                fill
                className="object-cover opacity-90"
                style={{ zIndex: 1 }}
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            )
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-[#5865F2]/25 via-[#a18fff]/20 to-[#6ee7f7]/15" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070913]/70 via-transparent to-transparent z-10" />
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {server.isFeatured && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#5865F2]/20 text-[#a18fff] border border-[#a18fff]/30">SPONSOR</span>
            )}
          </div>
          {/* Avatar */}
          <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 z-20">
            {server.avatarUrl ? (
              server.avatarUrl.endsWith('.gif') ? (
                <img
                  src={server.avatarUrl}
                  alt={server.name}
                  className="w-20 h-20 rounded-full border-4 border-[#18192b] shadow-lg object-cover bg-[#23243a]"
                  style={{ background: '#23243a' }}
                />
              ) : (
                <Image
                  src={server.avatarUrl}
                  alt={server.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-[#18192b] shadow-lg object-cover bg-[#23243a]"
                  style={{ background: '#23243a' }}
                  priority
                />
              )
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-[#18192b] shadow-lg bg-[#23243a] grid place-items-center text-white/40 font-bold text-2xl">#</div>
            )}
          </div>
      </div>

      {/* İçerik */}
        <div className="flex flex-col flex-1 pt-16 pb-4 px-5 items-center justify-between">
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg font-bold text-center truncate w-full" title={server.name}>{server.name}</h3>
          {server.category && (
            <div className="mt-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                {server.category}
              </span>
            </div>
          )}
          {server.description && (
            <p className="text-xs text-gray-400 text-center mt-1 line-clamp-2">{server.description}</p>
          )}
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 w-full mt-4 mb-2">
          <div className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 justify-center">
            <span>👥</span>
            <span>{typeof server.membersCount === "number" ? server.membersCount.toLocaleString("tr-TR") : "-"} üye</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 justify-center">
            <span>🟢</span>
            <span>{typeof server.presenceCount === "number" ? server.presenceCount.toLocaleString("tr-TR") : "-"} aktif</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 justify-center">
            <span>🔊</span>
            <span>{typeof server.voiceCount === "number" ? server.voiceCount.toLocaleString("tr-TR") : "-"} seste</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 justify-center">
            <span>🚀</span>
            <span>{typeof server.boostCount === "number" ? server.boostCount.toLocaleString("tr-TR") : "-"} boost</span>
          </div>
        </div>
        {/* Katıl butonu */}
        {href && (
          <a
            href={href}
            className="mt-2 w-full py-2 bg-gradient-to-r from-[#5865F2] to-[#a18fff] hover:from-[#4752c4] hover:to-[#7c5fff] text-white font-bold rounded-xl text-center transition border border-white/10"
          >
            Sunucuya Katıl <span className="opacity-80">→</span>
          </a>
        )}
      </div>
    </div>
  );
}
