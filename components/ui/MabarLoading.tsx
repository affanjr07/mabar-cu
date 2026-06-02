"use client"

import { motion } from "framer-motion"

interface MabarLoadingProps {
  text?: string
}

export default function MabarLoading({
  text = "LOADING MABAR.CU",
}: MabarLoadingProps) {
  // Array untuk merender 3 block indikator ala lego/grid modular
  const blocks = [0, 1, 2]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0E11] px-6 font-mono text-white select-none">
      <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center">
        
        {/* LOGO BOX MODULAR (MINIMALIS KICK / LEGO STYLE) */}
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center border-4 border-black bg-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:h-20 sm:w-20 sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-4xl font-black tracking-tighter text-black sm:text-5xl">
            M
          </span>
          {/* Ornamen stud/tonjolan lego minimalis di pojok kanan bawah */}
          <div className="absolute bottom-1 right-1 h-2 w-2 bg-black" />
        </div>

        {/* STATUS TEXT SECTION */}
        <div className="w-full text-center border-2 border-black bg-[#0E1318] p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#53FC18] sm:text-xs">
            {text}
          </h2>
          <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-zinc-500">
            // SQUAD_SYSTEM_PREPPING...
          </p>
        </div>

        {/* LEGO BLOCK PROGRESS TRACKER (GAYA KICK STRIP) */}
        <div className="mt-4 flex w-full gap-2">
          {blocks.map((index) => (
            <div 
              key={index} 
              className="h-3 flex-1 border-2 border-black bg-[#191B1F] relative overflow-hidden"
            >
              <motion.div
                className="h-full bg-[#53FC18]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                  delay: index * 0.15, // Efek sekuensial bergantian ala brick
                  repeatType: "reverse"
                }}
              />
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}