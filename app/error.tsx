"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#18192b] text-white">
      <h1 className="text-3xl font-bold mb-4">Bir hata oluştu</h1>
      <p className="mb-6 text-lg opacity-80">{error.message || "Beklenmeyen bir hata oluştu."}</p>
      <button onClick={() => reset()} className="px-6 py-2 bg-[#7c5fff] rounded-xl font-bold">Sayfayı Yenile</button>
    </div>
  );
}
