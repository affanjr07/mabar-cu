"use client"

export default function MabarLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E11] px-6 font-mono select-none overflow-hidden">
      
      {/* CONTAINER STRUKTUR UTAMA */}
      <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
        
        {/* ANIMASI GARIS LINGKARAN ELEKTRIK YANG MENGELILINGI CONTROLLER */}
        {/* Lingkaran Luar (Orbit Cepat) */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-dashed border-[#53FC18]/40 animate-[spin_4s_linear_infinite] sm:h-32 sm:w-32" />
        
        {/* Lingkaran Dalam (Garis Pindai Neon Tajam) */}
        <div className="absolute h-28 w-28 rounded-full border-t-2 border-b-2 border-l-2 border-[#53FC18] shadow-[0_0_15px_rgba(83,252,24,0.5)] animate-[spin_1.5s_cubic-bezier(0.53,0.21,0.29,0.67)_infinite] sm:h-36 sm:w-36" />

        {/* ========================================================= */}
        {/* CORE: BRUTALIST CONTROLLER / STIK PS (SILUET HURUF M) */}
        {/* ========================================================= */}
        <div className="relative flex h-16 w-20 items-center justify-center border-4 border-black bg-[#53FC18] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] animate-[bounce_2s_infinite] [animation-timing-function:cubic-bezier(0.28,0.84,0.42,1)] sm:h-20 sm:w-24">
          
          {/* Efek Kilatan Scanline Internal dari global.css */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-white/40 -skew-x-12 mix-blend-overlay animate-[mabarLoading_1.4s_ease-in-out_infinite]" />
            <div className="absolute top-0 left-0 h-full w-1/4 bg-black/10 -skew-x-12 animate-[mabarLoading_1.4s_ease-in-out_infinite] [animation-delay:0.4s]" />
          </div>

          {/* DETAIL IKON STIK (MEMBENTUK SILUET HURUF M SECARA GEOMETRIS) */}
          <div className="relative flex h-full w-full items-center justify-between px-2.5 z-10">
            
            {/* 1. KIRI: D-PAD (Tombol Arah Kotak Minimalis) */}
            <div className="relative h-5 w-5 flex items-center justify-center sm:h-6 sm:w-6">
              <div className="absolute h-full w-1.5 bg-black" />
              <div className="absolute h-1.5 w-full bg-black" />
            </div>

            {/* 2. TENGAH: COAKAN BAWAH (Memotong Box agar Terbentuk Siluet M yang Jelas) */}
            <div className="absolute bottom-0 left-1/2 h-4 w-6 -translate-x-1/2 border-t-4 border-x-4 border-black bg-[#0B0E11]" />
            
            {/* Tombol kecil Select & Start di bagian tengah atas */}
            <div className="absolute top-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              <div className="h-1 w-2 -skew-x-12 bg-black/60" />
              <div className="h-1 w-2 -skew-x-12 bg-black/60" />
            </div>

            {/* 3. KANAN: ACTION BUTTONS (Empat Titik Tombol PS Style) */}
            <div className="relative grid grid-cols-2 gap-1 rotate-45">
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
              <div className="h-1.5 w-1.5 rounded-full bg-black" />
            </div>

          </div>

          {/* ORNAMEN STUD LEGO TRADISIONAL DI SUDUT LUAR */}
          <div className="absolute -bottom-2 left-3 h-2 w-2 border-2 border-black bg-[#53FC18]" />
          <div className="absolute -bottom-2 right-3 h-2 w-2 border-2 border-black bg-[#53FC18]" />

        </div>
        {/* ========================================================= */}

        {/* EFEK GLOW AMBIENT BELAKANG */}
        <div className="absolute h-16 w-20 bg-[#53FC18]/10 blur-xl animate-pulse -z-10" />

      </div>
    </div>
  )
}