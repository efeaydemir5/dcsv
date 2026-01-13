"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/pending");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json.error || "unauthorized");
      setItems([]);
      setLoading(false);
      return;
    }
    setItems(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "loading") return <div className="p-6">Yükleniyor...</div>;
  if (!session?.user) return <div className="p-6">Admin panel için giriş yapmalısın.</div>;

  const setStatus = async (discordId: string, s: string) => {
    setMsg("");
    const res = await fetch(`/api/admin/servers/${discordId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json.error || "işlem başarısız");
      return;
    }
    setMsg(`Güncellendi: ${discordId} → ${s}`);
    load();
  };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(161,143,255,0.18),transparent_55%),radial-gradient(circle_at_80%_40%,rgba(110,231,247,0.12),transparent_55%)]" />
      <div className="relative max-w-6xl mx-auto p-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Admin Panel</h1>
        <p className="text-sm text-white/60 mt-2">Bekleyen sunucuları onayla veya reddet.</p>

        {msg && <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{msg}</div>}

        <div className="mt-8">
          {loading ? (
            <div className="text-white/70">Yükleniyor...</div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">Bekleyen sunucu yok.</div>
          ) : (
            <div className="space-y-4">
              {items.map((s) => (
                <div key={s.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{s.name}</div>
                    <div className="text-xs text-white/50">{s.discordId} • {s.category ?? "-"}</div>
                    <div className="text-sm text-white/70 mt-2 line-clamp-2">{s.shortDesc ?? s.description ?? ""}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 hover:bg-emerald-500/25 transition" onClick={() => setStatus(s.discordId, "ACTIVE")}>Onayla</button>
                    <button className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-400/30 hover:bg-rose-500/25 transition" onClick={() => setStatus(s.discordId, "REJECTED")}>Reddet</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

