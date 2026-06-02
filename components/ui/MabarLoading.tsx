"use client"

export default function MabarLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E11] px-6 font-mono select-none">
      
      {/* LEGO BLOCK LOGO (SUPER MINIMALIS & LIGHTWEIGHT) */}
      <div className="relative flex h-20 w-20 items-center justify-center border-4 border-black bg-[#53FC18] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] sm:h-24 sm:w-24">
        
        {/* HURUF M LEGO DENGAN INTEGRASI ANIMASI GLOBAL.CSS */}
        <span className="relative overflow-hidden text-5xl font-black tracking-tighter text-black sm:text-6xl">
          M
          
          {/* EFEK SCANLINE / LOADING STRIP MEMOTONG DI DALAM HURUF M */}
          <div 
            className="absolute top-0 left-0 h-full w-1/3 bg-white/40 skew-x-12 mix-blend-overlay animate-[mabarLoading_1.4s_ease-in-out_infinite]" 
          />
        </span>

        {/* ORNAMEN STUD/TONJOLAN LEGO MINIMALIS */}
        <div className="absolute bottom-1 right-1 h-2 w-2 bg-black" />
        <div className="absolute top-1 left-1 h-1.5 w-1.5 bg-black/20" />
        
      </div>

    </div>
  )
}