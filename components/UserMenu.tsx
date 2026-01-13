"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (!session) {
    return (
      <button onClick={() => signIn("discord")}
        className="px-4 py-2 rounded-xl font-bold bg-gradient-to-r from-[#5865F2] to-[#a18fff] hover:from-[#4752c4] hover:to-[#7c5fff] transition shadow-lg shadow-[#5865F2]/20 border border-white/10">
        Discord ile Giriş Yap
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={session.user?.image ?? ""} alt="avatar" className="w-9 h-9 rounded-full ring-2 ring-white/10" />
      <span className="font-semibold text-white/90 hidden sm:block">{session.user?.name}</span>
      <button onClick={() => signOut()} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition">Çıkış</button>
    </div>
  );
}
