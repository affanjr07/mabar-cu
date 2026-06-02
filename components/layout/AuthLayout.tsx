"use client"

import { memo } from "react"

function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black">

      {/* LEFT SIDE (BRUTALIST GAMING BANNER) - Sembunyi di Mobile & Tablet */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r-4 border-black bg-[#0E1318] p-12 lg:flex overflow-hidden">
        
        {/* BACKGROUND IMAGE DENGAN LAY-LOAD (Optimasi Performa) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity transform scale-105 will-change-transform"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop')` 
          }} 
          role="img"
          aria-label="Gaming Background"
        />
        {/* Gradient Tint Hijau-Hitam Khas Kick */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/90 via-[#0B0E11]/40 to-[#53FC18]/10" />

        {/* LOGO AREA */}
        <div className="relative z-10">
          <div className="inline-block border-2 border-black bg-[#53FC18] px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              MABAR.CO
            </h1>
          </div>

          <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-400">
            // FIND YOUR ULTIMATE SQUAD.
          </p>
        </div>

        {/* HERO TEXT AREA */}
        <div className="relative z-10 space-y-4">
          <div className="inline-block border-2 border-black bg-[#191B1F] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-5xl font-black leading-none tracking-tight uppercase text-white">
              PUSH RANK
              <br />
              <span className="text-[#53FC18]">TOGETHER.</span>
            </h2>
          </div>

          <div className="border border-black bg-black/80 p-4 max-w-md">
            <p className="text-xs font-bold uppercase leading-relaxed text-zinc-500">
              Cari teman mabar, bangun party, dan menangkan pertandingan bersama di arena kompetitif.
            </p>
          </div>
        </div>

        {/* DECORATIVE FOOTER BLOCK */}
        <div className="relative z-10 text-[10px] font-black tracking-widest text-zinc-600 uppercase">
          [ SYSTEM_ONLINE // REGION_ID ]
        </div>

      </div>

      {/* RIGHT SIDE (FORM CONTAINER) - 100% Lebar di Mobile, Nyaman & Ringan */}
      <div className="flex w-full min-h-screen items-center justify-center p-4 sm:p-6 lg:w-1/2 bg-[#0B0E11]">
        {/* Dikurangi padding luar (p-4) agar form login tidak terjepit di HP layar sempit */}
        <div className="w-full max-w-md flex flex-col justify-center animate-in fade-in duration-200">
          {children}
        </div>
      </div>

    </main>
  )
}

// OPTIMASI: Dibungkus memo agar layout statis ini tidak ikut dirender ulang secara sia-sia saat state form anak (login) berubah.
export default memo(AuthLayout)