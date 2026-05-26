"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { socket } from "@/lib/socket"

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  // --- AUDIO SYNTHESIZER GLOBAL UNTUK ANNOUNCEMENT ---
  const playGlobalAnnouncementSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      
      // Nada pertama (D5 - Bersih & Ringan)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime)
      gain1.gain.setValueAtTime(0.1, ctx.currentTime)
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)

      // Nada kedua (A5 - Lebih Tinggi) berbunyi setelah delay 100ms
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1)
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1)
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc1.start()
      osc1.stop(ctx.currentTime + 0.15)
      
      osc2.start(ctx.currentTime + 0.1)
      osc2.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.error("Gagal memutar audio pengumuman global:", e)
    }
  }

  // Efek pengalihan rute jika tidak terautentikasi
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login")
    }
  }, [hasHydrated, isAuthenticated, router])

  // --- LOGIKA LISTENER REAL-TIME SOCKET GLOBAL ---
  useEffect(() => {
    // Hanya pasang listener jika user sudah terautentikasi dan sesi ter-hidrasi
    if (!hasHydrated || !isAuthenticated) return

    if (!socket.connected) {
      socket.connect()
    }

    function handleGlobalAnnouncement(data: any) {
      console.log("Pengumuman Global Diterima di ProtectedRoute:", data)
      playGlobalAnnouncementSound()
    }

    // Mendengarkan event dari server
    socket.on("announcement_banner", handleGlobalAnnouncement)

    // Cleanup listener saat komponen di-unmount atau user logout
    return () => {
      socket.off("announcement_banner", handleGlobalAnnouncement)
    }
  }, [hasHydrated, isAuthenticated])

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-green-400 font-mono">
        Loading session...
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-green-400 font-mono">
        Redirecting...
      </main>
    )
  }

  return <>{children}</>
}