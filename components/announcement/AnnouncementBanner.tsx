"use client"

import { useEffect, useState } from "react"
import { X, Megaphone } from "lucide-react"
import { socket } from "@/lib/socket"
import { getActiveAnnouncements } from "@/services/announcement.service"

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])

  async function loadAnnouncements() {
    try {
      const data = await getActiveAnnouncements()
      console.log("ACTIVE ANNOUNCEMENTS:", data)
      setAnnouncements(data || [])
    } catch (error: any) {
      console.log("ANNOUNCEMENT ERROR:", error.response?.data || error.message)
      setAnnouncements([])
    }
  }

  useEffect(() => {
    loadAnnouncements()

    if (!socket.connected) socket.connect()

    socket.on("announcement_received", (announcement) => {
      setAnnouncements((prev) => {
        const exists = prev.some((item) => item.id === announcement.id)
        if (exists) return prev
        return [announcement, ...prev]
      })
    })

    return () => {
      socket.off("announcement_received")
    }
  }, [])

  const visibleAnnouncements = announcements.filter(
    (item) => !hiddenIds.includes(item.id)
  )

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="space-y-4 font-mono">
      {visibleAnnouncements.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden border-2 border-black bg-[#53FC18] p-5 text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          {/* BACKGROUND TEXT MARQUEE - Memberikan efek visual sistem yang sibuk */}
          <div className="absolute top-1 left-0 right-0 pointer-events-none select-none opacity-[0.07] whitespace-nowrap overflow-hidden text-[70px] font-black tracking-tighter uppercase leading-none">
            <div className="inline-block animate-marquee-fast">
              SYSTEM ALERT // BROADCAST LIVE // TOURNAMENT // EVENT //&nbsp;
            </div>
            <div className="inline-block animate-marquee-fast">
              SYSTEM ALERT // BROADCAST LIVE // TOURNAMENT // EVENT //&nbsp;
            </div>
          </div>

          {/* CLOSE BUTTON BRUTALIST */}
          <button
            type="button"
            onClick={() => setHiddenIds((prev) => [...prev, item.id])}
            className="absolute right-4 top-4 z-10 border-2 border-black bg-black p-1.5 text-[#53FC18] transition-all hover:bg-neutral-900 active:translate-x-[1px] active:translate-y-[1px]"
            title="Dismiss Announcement"
          >
            <X size={14} className="stroke-[3]" />
          </button>

          {/* BADGE SYSTEM & ALIGNMENT */}
          <div className="relative z-10 flex items-start gap-4">
            {/* Animated Icon Container */}
            <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center border-2 border-black bg-black text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
              <Megaphone size={20} className="animate-bounce" />
            </div>

            <div className="flex-1 pr-8">
              {/* META TOP PENANDA */}
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 animate-ping bg-black" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black/70">
                  // ANNOUNCEMENT SYSTEM !!!
                </p>
              </div>

              {/* JUDUL UTAMA */}
              <h2 className="mt-1 text-xl font-black uppercase tracking-tight md:text-2xl break-words">
                {item.title}
              </h2>

              {/* ISI PESAN */}
              <p className="mt-1 text-xs font-bold uppercase leading-relaxed text-neutral-900/90 break-words">
                {item.message}
              </p>
            </div>
          </div>

          {/* DEKORASI BARCODE MINI DI POJOK BAWAH (Estetika Brutalist Cyber) */}
          <div className="absolute bottom-1 right-4 opacity-20 text-[9px] font-bold tracking-tighter select-none pointer-events-none hidden md:block">
            ||||| | |||| || ||| |||| | || 2026_SYS_ANN
          </div>
        </div>
      ))}
    </div>
  )
}