"use client";
import { useState, useEffect } from "react";
import ServerCard from "@/components/ServerCard";

export default function FeaturedServers() {
  const [servers, setServers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchServers = async (q = "") => {
    setLoading(true);
    // List all servers by default; use "featured=true" only if you want to show featured ones.
    const res = await fetch(`/api/servers?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setServers(data.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleSearch = (e: any) => {
    e.preventDefault();
    fetchServers(query);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(161,143,255,0.20),transparent_50%),radial-gradient(circle_at_80%_40%,rgba(88,101,242,0.18),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(110,231,247,0.14),transparent_50%)]" />
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      <header className="relative z-10 pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Tamamen ücretsiz • Discord sunucu listesi
          </div>

          <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#a18fff] via-[#6ee7f7] to-[#5865F2] text-transparent bg-clip-text">
            Discord Sunucuları
          </h1>

          <p className="mt-4 text-lg md:text-xl text-white/70 max-w-2xl">
            Sunucunu ücretsiz tanıt, yeni üyeler kazan. Kategoriler, öne çıkarma ve hızlı arama ile topluluğunu büyüt.
          </p>

          <form className="mt-8" onSubmit={handleSearch}>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur">
              <input
                className="flex-1 px-4 py-3 bg-transparent text-white placeholder-white/40 outline-none"
                placeholder="Sunucu adı ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-[#5865F2] to-[#a18fff] hover:from-[#4752c4] hover:to-[#7c5fff] transition border border-white/10"
                disabled={loading}
              >
                {loading ? "Aranıyor..." : "Ara"}
              </button>
            </div>
          </form>
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white/90">Öne Çıkan Sunucular</h3>
          <div className="text-xs text-white/50">Öne çıkarma: 2 saatte bir</div>
        </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-stretch">
          {loading ? (
            <div className="col-span-full text-center text-gray-400 text-lg py-16">Yükleniyor...</div>
          ) : servers.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 text-lg py-16">Henüz öne çıkarılan sunucu yok.</div>
          ) : (
            servers.map(s => (
              <ServerCard key={s.id} server={s} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
