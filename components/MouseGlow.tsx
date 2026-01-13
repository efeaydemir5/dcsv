"use client";

import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = e.clientX;
        const y = e.clientY;
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
      style={{
        background:
          "radial-gradient(360px circle at var(--mx, 50%) var(--my, 30%), rgba(161,143,255,0.20), transparent 55%), radial-gradient(520px circle at calc(var(--mx, 50%) + 120px) calc(var(--my, 30%) + 80px), rgba(110,231,247,0.10), transparent 60%)",
      }}
    />
  );
}

