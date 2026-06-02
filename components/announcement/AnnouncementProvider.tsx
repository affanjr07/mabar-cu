"use client"

import { useEffect, useState } from "react"
import { getActiveAnnouncements } from "@/services/announcement.service"

interface Announcement {
  id: string
  title: string
  message: string
  type?: "info" | "warning" | "danger" | "success" | string
  created_at?: string
}

function getSeenIds() {
  if (typeof window === "undefined") return []

  try {
    return JSON.parse(localStorage.getItem("seen_announcements") || "[]")
  } catch {
    return []
  }
}

function saveSeenId(id: string) {
  const ids = getSeenIds()
  const nextIds = Array.from(new Set([...ids, id]))
  localStorage.setItem("seen_announcements", JSON.stringify(nextIds))
}

function getTypeClass(type?: string) {
  switch (type) {
    case "danger":
      return "bg-red-600 text-white shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]"
    case "warning":
      return "bg-yellow-400 text-black shadow-[6px_6px_0px_0px_rgba(250,204,21,1)]"
    case "success":
      return "bg-[#53FC18] text-black shadow-[6px_6px_0px_0px_rgba(83,252,24,1)]"
    default:
      return "bg-[#0E1318] text-white shadow-[6px_6px_0px_0px_rgba(83,252,24,1)]"
  }
}

export default function AnnouncementProvider() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadAnnouncements() {
    if (loading) return

    try {
      setLoading(true)

      const data = await getActiveAnnouncements()
      const list: Announcement[] = Array.isArray(data) ? data : []

      const seenIds = getSeenIds()
      const newAnnouncement = list.find((item) => !seenIds.includes(item.id))

      if (newAnnouncement) {
        setAnnouncement(newAnnouncement)
      }
    } catch (error) {
      console.log("Announcement polling failed:", error)
    } finally {
      setLoading(false)
    }
  }

  function closeAnnouncement() {
    if (announcement?.id) {
      saveSeenId(announcement.id)
    }

    setAnnouncement(null)
  }

  useEffect(() => {
    loadAnnouncements()

    const interval = setInterval(() => {
      loadAnnouncements()
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  if (!announcement) return null

  return (
    <div className="fixed inset-x-0 top-5 z-[9999] flex justify-center px-4 font-mono">
      <div
        className={`w-full max-w-xl border-4 border-black p-5 ${getTypeClass(
          announcement.type
        )}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-70">
              // SYSTEM ANNOUNCEMENT
            </p>

            <h2 className="mt-2 text-xl font-black uppercase tracking-tight">
              {announcement.title}
            </h2>

            <p className="mt-2 text-xs font-bold uppercase leading-relaxed opacity-90">
              {announcement.message}
            </p>
          </div>

          <button
            onClick={closeAnnouncement}
            className="border-2 border-black bg-black px-3 py-1 text-xs font-black uppercase text-white"
          >
            X
          </button>
        </div>
      </div>
    </div>
  )
}