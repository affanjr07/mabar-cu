"use client"

import { useEffect, useState, useRef } from "react"
import { X, Megaphone, Radio, BellRing } from "lucide-react"
import { socket } from "@/lib/socket"
import { getActiveAnnouncements } from "@/services/announcement.service"

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  
  // State bantuan untuk memicu re-render berkala (mengecek jadwal masuk)
  const [, setTick] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/sounds/broadcast-notif.mp3")
    audioRef.current.volume = 0.6
  }, [])

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

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0 
      audioRef.current.play().catch((err) => {
        console.warn("Autoplay suara diblokir oleh browser sampai user berinteraksi.", err)
      })
    }
  }

  useEffect(() => {
    loadAnnouncements()

    if (!socket.connected) socket.connect()

    socket.on("announcement_received", (announcement) => {
      setAnnouncements((prev) => {
        const exists = prev.some((item) => item.id === announcement.id)
        if (exists) return prev
        
        // Memeriksa jika announcement bersifat instan (tanpa starts_at) atau sudah lewat waktunya
        const now = new Date()
        const startTime = announcement.starts_at ? new Date(announcement.starts_at) : null
        
        if (!startTime || startTime <= now) {
          // Jika instan/sudah masuk waktunya, langsung bunyikan notifikasi
          playNotificationSound()
        }
        
        return [announcement, ...prev]
      })
    })

    // SYSTEM TICKER: Mengecek status waktu setiap 1 detik
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)

    return () => {
      socket.off("announcement_received")
      clearInterval(timer)
    }
  }, [])

  // --- LOGIKA FILTERING JADWAL AKTIF ---
  const now = new Date()

  const visibleAnnouncements = announcements.filter((item) => {
    // 1. Jangan munculkan jika di-dismiss oleh user
    if (hiddenIds.includes(item.id)) return false

    // 2. Cek batasan Waktu Mulai (starts_at)
    if (item.starts_at) {
      const startTime = new Date(item.starts_at)
      if (startTime > now) return false // Belum waktunya muncul!
    }

    // 3. Cek batasan Waktu Berakhir (ends_at)
    if (item.ends_at) {
      const endTime = new Date(item.ends_at)
      if (endTime < now) return false // Sudah kedaluwarsa!
    }

    return true
  })

  // Efek samping: Bunyikan suara tepat saat pengumuman terjadwal berubah status menjadi 'visible'
  const prevVisibleIds = useRef<string[]>([])
  useEffect(() => {
    const currentIds = visibleAnnouncements.map(a => a.id)
    // Cari tahu apakah ada ID baru yang sebelumnya tidak terlihat tapi sekarang terlihat
    const hasNewActivation = currentIds.some(id => !prevVisibleIds.current.includes(id))
    
    if (hasNewActivation && prevVisibleIds.current.length > 0) {
      playNotificationSound()
    }
    prevVisibleIds.current = currentIds
  }, [visibleAnnouncements])

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="space-y-4 font-mono p-4 md:p-6 max-w-7xl mx-auto w-full">
      {visibleAnnouncements.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden border-4 border-black bg-[#53FC18] p-5 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 animate-in fade-in slide-in-from-top-6"
        >
          <div className="absolute top-0 left-0 bottom-0 w-3 bg-black" />

          <div className="absolute top-1 left-4 right-0 pointer-events-none select-none opacity-[0.06] whitespace-nowrap overflow-hidden text-[80px] font-black tracking-tighter uppercase leading-none">
            <div className="inline-block animate-marquee-fast">
              SYSTEM BROADCAST CRITICAL INBOUND // LIVE STREAMING // NETWORK EVENT //&nbsp;
            </div>
            <div className="inline-block animate-marquee-fast">
              SYSTEM BROADCAST CRITICAL INBOUND // LIVE STREAMING // NETWORK EVENT //&nbsp;
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHiddenIds((prev) => [...prev, item.id])}
            className="absolute right-3 top-3 z-20 border-2 border-black bg-black p-2 text-[#53FC18] transition-all hover:bg-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            title="Dismiss Announcement"
          >
            <X size={16} className="stroke-[3]" />
          </button>

          <div className="relative z-10 flex items-start gap-5 pl-4">
            <div className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center border-4 border-black bg-black text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
              <span className="absolute inset-0 border border-dashed border-[#53FC18] animate-spin duration-1000 opacity-40" />
              <Megaphone size={24} className="animate-bounce" />
            </div>

            <div className="flex-1 pr-10">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/80">
                <div className="flex items-center gap-1.5 bg-black text-[#53FC18] px-2 py-0.5 border border-black">
                  <Radio size={12} className="animate-pulse text-red-500" />
                  <span>ANNOUNCEMENT</span>
                </div>
                <span>// ID: {item.id?.substring(0, 8)}</span>
                {item.created_at && (
                  <span className="hidden sm:inline">• ARRIVED AT {new Date(item.created_at).toLocaleTimeString("id-ID")}</span>
                )}
              </div>

              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight md:text-3xl break-words leading-none">
                {item.title}
              </h2>

              <p className="mt-2 text-sm font-bold uppercase leading-relaxed text-black/90 max-w-5xl break-words bg-black/5 p-3 border border-black/10">
                {item.message}
              </p>
            </div>
          </div>

          <div className="absolute bottom-2 right-4 opacity-30 text-[10px] font-black tracking-tighter select-none pointer-events-none hidden md:flex items-center gap-2">
            <BellRing size={12} className="animate-ping text-black" />
            <span>||||| | |||| || ||| |||| | || OVERRIDE_2026</span>
          </div>
        </div>
      ))}
    </div>
  )
}