"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { X, Megaphone, Radio, BellRing } from "lucide-react"
import { getActiveAnnouncements } from "@/services/announcement.service"

interface Announcement {
  id: string
  title: string
  message: string
  type?: string
  starts_at?: string | null
  ends_at?: string | null
  created_at?: string
}

const STORAGE_KEY = "mabar_seen_announcements"
const HIDDEN_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"]

function getSeenIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  } catch {
    return []
  }
}

function saveSeenId(id: string) {
  const seenIds = getSeenIds()
  const nextIds = Array.from(new Set([...seenIds, id]))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds))
}

function isAnnouncementActive(item: Announcement) {
  const now = new Date()

  if (item.starts_at && new Date(item.starts_at) > now) return false
  if (item.ends_at && new Date(item.ends_at) < now) return false

  return true
}

function shouldHideOnPath(pathname: string) {
  return HIDDEN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}

export default function AnnouncementBanner() {
  const pathname = usePathname()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const previousVisibleIds = useRef<string[]>([])
  const hasLoadedOnce = useRef(false)
  const userHasInteracted = useRef(false)

  const isHiddenPage = shouldHideOnPath(pathname)

  async function loadAnnouncements() {
    if (loading || isHiddenPage) return

    try {
      setLoading(true)

      const data = await getActiveAnnouncements()
      const list = Array.isArray(data) ? data : []

      setAnnouncements(list)
    } catch (error: any) {
      console.log("ANNOUNCEMENT ERROR:", error.response?.data || error.message)
    } finally {
      setLoading(false)
      hasLoadedOnce.current = true
    }
  }

  function playNotificationSound() {
    if (!audioRef.current) return

    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {
      console.warn("Sound blocked until user interacts with page.")
    })
  }

  function handleDismiss(id: string) {
    saveSeenId(id)
    setHiddenIds((prev) => Array.from(new Set([...prev, id])))
  }

  useEffect(() => {
    function markInteraction() {
      userHasInteracted.current = true
    }

    window.addEventListener("click", markInteraction)
    window.addEventListener("keydown", markInteraction)
    window.addEventListener("touchstart", markInteraction)

    return () => {
      window.removeEventListener("click", markInteraction)
      window.removeEventListener("keydown", markInteraction)
      window.removeEventListener("touchstart", markInteraction)
    }
  }, [])

  useEffect(() => {
    audioRef.current = new Audio("/sounds/broadcast-notif.mp3")
    audioRef.current.volume = 0.55

    const seenIds = getSeenIds()
    setHiddenIds(seenIds)
  }, [])

  useEffect(() => {
    if (isHiddenPage) {
      setAnnouncements([])
      return
    }

    loadAnnouncements()

    const interval = setInterval(() => {
      loadAnnouncements()
    }, 7000)

    return () => clearInterval(interval)
  }, [pathname, isHiddenPage])

  const visibleAnnouncements = announcements.filter((item) => {
    if (!item?.id) return false
    if (hiddenIds.includes(item.id)) return false
    return isAnnouncementActive(item)
  })

  useEffect(() => {
    if (isHiddenPage) return

    const currentIds = visibleAnnouncements.map((item) => item.id)
    const hasNew = currentIds.some(
      (id) => !previousVisibleIds.current.includes(id)
    )

    if (hasLoadedOnce.current && hasNew && currentIds.length > 0) {
      if (userHasInteracted.current || previousVisibleIds.current.length > 0) {
        playNotificationSound()
      }
    }

    previousVisibleIds.current = currentIds
  }, [visibleAnnouncements, isHiddenPage])

  if (isHiddenPage) return null
  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="fixed inset-x-0 top-4 z-[9999] mx-auto w-full max-w-7xl space-y-4 px-4 font-mono md:top-6 md:px-6">
      {visibleAnnouncements.map((item) => (
        <div
          key={item.id}
          className="relative overflow-hidden border-4 border-black bg-[#53FC18] p-5 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="absolute bottom-0 left-0 top-0 w-3 bg-black" />

          <div className="pointer-events-none absolute left-4 right-0 top-1 select-none overflow-hidden whitespace-nowrap text-[70px] font-black uppercase leading-none tracking-tighter opacity-[0.06]">
            SYSTEM BROADCAST // MABAR.CU // SYSTEM BROADCAST //
          </div>

          <button
            type="button"
            onClick={() => handleDismiss(item.id)}
            className="absolute right-3 top-3 z-20 border-2 border-black bg-black p-2 text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-900"
          >
            <X size={16} className="stroke-[3]" />
          </button>

          <div className="relative z-10 flex items-start gap-5 pl-4">
            <div className="relative hidden h-14 w-14 shrink-0 items-center justify-center border-4 border-black bg-black text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:flex">
              <span className="absolute inset-0 animate-spin border border-dashed border-[#53FC18] opacity-40" />
              <Megaphone size={24} className="animate-bounce" />
            </div>

            <div className="flex-1 pr-10">
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-black/80">
                <div className="flex items-center gap-1.5 border border-black bg-black px-2 py-0.5 text-[#53FC18]">
                  <Radio size={12} className="animate-pulse text-red-500" />
                  <span>ANNOUNCEMENT</span>
                </div>

                <span>// ID: {item.id.substring(0, 8)}</span>

                {item.created_at && (
                  <span className="hidden sm:inline">
                    • {new Date(item.created_at).toLocaleTimeString("id-ID")}
                  </span>
                )}
              </div>

              <h2 className="mt-2 break-words text-2xl font-black uppercase leading-none tracking-tight md:text-3xl">
                {item.title}
              </h2>

              <p className="mt-2 max-w-5xl break-words border border-black/10 bg-black/5 p-3 text-sm font-bold uppercase leading-relaxed text-black/90">
                {item.message}
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-2 right-4 hidden select-none items-center gap-2 text-[10px] font-black tracking-tighter opacity-30 md:flex">
            <BellRing size={12} className="animate-ping text-black" />
            <span>||||| | |||| || ||| |||| | || LIVE_BROADCAST</span>
          </div>
        </div>
      ))}
    </div>
  )
}