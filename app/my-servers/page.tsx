"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ServerCard from "@/components/ServerCard";

export default function MyServersPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const fetchMine = async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    const res = await fetch("/api/servers?mine=true");
    const json = await res.json().catch(() => ({}));
    setServers(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "loading") return <div className="p-6">Yükleniyor...</div>;
  if (!session?.user) return <div className="p-6">Sunucularını görmek için giriş yapmalısın.</div>;

  const handleBump = async (discordId: string) => {
    setMsg("");
    const res = await fetch(`/api/servers/${discordId}/bump`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerDiscordId: (session.user as any).id }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (json?.error === "cooldown" && json?.remainingMs) {
        const secs = Math.ceil(json.remainingMs / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        setMsg(`Tekrar öne çıkarabilmek için bekle: ${m}dk ${s}sn`);
      } else {
        setMsg(json.error || "Öne çıkarma başarısız.");
      }
      return;
    }
    setMsg("Sunucun öne çıkarıldı!");
    fetchMine();
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(161,143,255,0.18),transparent_55%),radial-gradient(circle_at_90%_40%,rgba(110,231,247,0.12),transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Sunucularım</h1>
            <p className="text-sm text-white/60 mt-2">Burası sadece senin eklediğin sunucuları gösterir. Öne çıkarma 2 saatte bir.</p>
          </div>
          <a href="/add-server" className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-semibold">
            Sunucu Ekle →
          </a>
        </div>

        {msg && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="text-white/70">Yükleniyor...</div>
        ) : servers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Henüz sunucu eklemedin.
            <div className="mt-3 text-sm text-white/50">Sunucunda <span className="font-mono">/sunucuekle</span> komutunu kullanarak ekleyebilirsin.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {servers.map((s) => (
              <div key={s.id} className="relative">
                <ServerCard server={s} />
                <button
                  className="mt-3 w-full px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-[#5865F2] to-[#a18fff] hover:from-[#4752c4] hover:to-[#7c5fff] transition border border-white/10"
                  onClick={() => handleBump(s.discordId)}
                >
                  Öne Çıkar (2 saatte bir)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
