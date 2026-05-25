export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">

      {/* LEFT SIDE (BRUTALIST GAMING BANNER) */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r-4 border-black bg-[#0E1318] p-12 lg:flex">
        
        {/* BACKGROUND IMAGE DENGAN FILTER OVERLAY KICK */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop')` 
          }} 
        />
        {/* Gradient Tint Hijau-Hitam Khas Kick */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/90 via-[#0B0E11]/40 to-[#53FC18]/10" />

        {/* LOGO AREA */}
        <div className="relative z-10">
          <div className="inline-block border-2 border-black bg-[#53FC18] px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              MABAR.CU
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

      {/* RIGHT SIDE (FORM CONTAINER) */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 bg-[#0B0E11]">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

    </main>
  )
}