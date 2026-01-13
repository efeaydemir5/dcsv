"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function AddServerPage() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedGuildName, setSelectedGuildName] = useState<string>("");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/discord/guilds").then(r => r.json()).then(d => setGuilds(d.guilds || []));
    }
  }, [status]);

  if (status === "loading") return <div>Yükleniyor...</div>;
  if (!session || !session.user) return <div className="text-center mt-10">Sunucu eklemek için giriş yapmalısınız.</div>;

  // Sunucu ekleme artık bot komutuyla yapılır.
  // Bu sayfa sadece botu sunucuya ekleme ve doğrulama adımlarını yönetir.

  return (
    <div className="max-w-xl mx-auto mt-10 bg-[#18192b] p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Sunucu Ekle</h1>
      <div className="flex flex-col gap-4">
        <label className="font-semibold">Sunucunuzu Seçin</label>
        <select required value={selected} onChange={e => setSelected(e.target.value)} className="p-2 rounded bg-[#23243a] text-white">
          <option value="">Bir sunucu seçin...</option>
          {guilds.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            const g = guilds.find((x: any) => x.id === selected);
            setSelectedGuildName(g?.name ?? "");
            window.location.href = `/api/discord/bot/authorize?guildId=${encodeURIComponent(selected)}`;
          }}
          className="px-4 py-2 bg-[#5865F2] text-white rounded-lg font-bold hover:bg-[#4752c4] transition disabled:opacity-50"
        >
          Botu Ekle ve Sunucuyu Doğrula
        </button>
        <div className="text-sm text-gray-400">
          1) Sunucunuzu seçin ve botu ekleyin.
          <br />
          2) Bot eklendikten sonra Discord sizi buraya geri yönlendirecek.
          <br />
          3) Son adım olarak sunucunuzda şu komutu çalıştırın:
          <div className="mt-2 font-mono text-xs bg-black/30 p-2 rounded">/sunucuekle aciklama:... kategori:...</div>
        </div>
        {message && <div className="text-center mt-2 text-green-400">{message}</div>}
      </div>
    </div>
  );
}
