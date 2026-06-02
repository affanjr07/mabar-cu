"use client"

export default function MabarLoading({
  mode = "full",
}: {
  mode?: "full" | "section"
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-[#0B0E11] px-6 font-mono select-none overflow-hidden ${
        mode === "full" ? "min-h-screen" : "min-h-[420px] w-full"
      }`}
    >
      {/* WRAPPER UTAMA (RESPONSIVE & COMPACT) */}
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        
        {/* 1. LINGKARAN TRACKING LASER (KICK NEON ORBIT) */}
        {/* Mengitari logo gamer dengan putaran halus dan bayangan pendaran neon */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-dashed border-[#53FC18]/30 animate-[spin_5s_linear_infinite] sm:h-30 sm:w-30" />
        <div className="absolute h-26 w-26 rounded-full border-t-2 border-[#53FC18] shadow-[0_0_12px_rgba(83,252,24,0.4)] animate-[spin_1.2s_ease-in-out_infinite] sm:h-32 sm:w-32" />

        {/* ========================================================= */}
        {/* 2. CORE: LEGO D-PAD MATRIX (MEMBENTUK SILUET HURUF "M") */}
        {/* ========================================================= */}
        {/* Struktur utama stik/lego yang memantul dengan entakan konstan */}
        <div className="relative flex h-16 w-16 items-center justify-center border-4 border-black bg-[#191B1F] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] animate-[bounce_2s_infinite] [animation-timing-function:cubic-bezier(0.28,0.84,0.42,1)] sm:h-20 sm:w-20">
          
          {/* Efek Kilatan Scanline Internal dari global.css */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white/10 -skew-x-12 animate-[mabarLoading_1.4s_ease-in-out_infinite]" />
            <div className="absolute top-0 left-0 h-full w-1/4 bg-[#53FC18]/10 -skew-x-12 animate-[mabarLoading_1.4s_ease-in-out_infinite] [animation-delay:0.4s]" />
          </div>

          {/* SUSUNAN TOMBOL ARAH (GAMER D-PAD) YANG MEMBENTUK HURUF M */}
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            {/* Sayap Kiri M (Sayap D-Pad Kiri) */}
            <div className="absolute top-3 left-0 h-7 w-3 border-2 border-black bg-[#53FC18] shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
            
            {/* Puncak Tengah M (Tombol D-Pad Atas) */}
            <div className="absolute top-0 left-1/2 h-6 w-3 -translate-x-1/2 border-2 border-black bg-[#53FC18]" />
            
            {/* Sayap Kanan M (Sayap D-Pad Kanan) */}
            <div className="absolute top-3 right-0 h-7 w-3 border-2 border-black bg-[#53FC18] shadow-[1px_1px_0px_rgba(0,0,0,1)]" />
            
            {/* Inti Pusat Konektor (Background Gelap Pengunci Pola M) */}
            <div className="absolute top-3 left-1/2 h-3 w-3 -translate-x-1/2 border-2 border-black bg-[#0B0E11]" />
            
            {/* Titik Indikator LED Mikro di tengah atas */}
            <div className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black/60 animate-pulse" />
          </div>

          {/* ORNAMEN TONJOLAN (STUD) LEGO MINIMALIS DI SUDUT BAWAH */}
          <div className="absolute -bottom-2 left-2 h-1.5 w-1.5 border border-black bg-[#53FC18]" />
          <div className="absolute -bottom-2 right-2 h-1.5 w-1.5 border border-black bg-[#53FC18]" />

        </div>
        {/* ========================================================= */}

        {/* 3. BACKGROUND AMBIENT GLOW */}
        <div className="absolute h-14 w-14 bg-[#53FC18]/5 blur-xl animate-pulse -z-10" />
        
      </div>
    </div>
  )
}