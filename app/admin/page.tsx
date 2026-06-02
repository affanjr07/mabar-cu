"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/store/auth.store"
import {
  createAnnouncement,
  deleteAnnouncement,
  getAdminAnnouncements,
} from "@/services/admin.service"

interface Announcement {
  id: string
  title: string
  message: string
  starts_at?: string | null
  ends_at?: string | null
  is_active?: boolean
  created_at?: string
}

export default function AdminPage() {
  const user = useAuthStore((state) => state.user) as any

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    starts_at: "",
    ends_at: "",
  })

  const isAdmin = user?.role === "admin"

  async function loadData() {
    try {
      setLoading(true)
      setMessage("")

      const data = await getAdminAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : data?.announcements || [])
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil data admin.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage("")

      if (!announcement.title.trim() || !announcement.message.trim()) {
        setMessage("Title dan message wajib diisi.")
        return
      }

      const startsAt = announcement.starts_at
        ? new Date(announcement.starts_at).toISOString()
        : null

      const endsAt = announcement.ends_at
        ? new Date(announcement.ends_at).toISOString()
        : null

      if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
        setMessage("Waktu selesai harus lebih besar dari waktu mulai.")
        return
      }

      await createAnnouncement({
        title: announcement.title.trim(),
        message: announcement.message.trim(),
        starts_at: startsAt,
        ends_at: endsAt,
      })

      setAnnouncement({
        title: "",
        message: "",
        starts_at: "",
        ends_at: "",
      })

      setMessage("Announcement berhasil dipublish.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat announcement.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    const confirmDelete = confirm("Nonaktifkan announcement ini?")
    if (!confirmDelete) return

    try {
      setMessage("")
      await deleteAnnouncement(id)
      setMessage("Announcement berhasil dinonaktifkan.")
      await loadData()
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Gagal menonaktifkan announcement."
      )
    }
  }

  function formatDate(date?: string | null) {
    if (!date) return "Tidak dibatasi"

    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
          <Sidebar />

          <section className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-8 text-center shadow-[6px_6px_0px_0px_rgba(239,68,68,1)]">
              <h1 className="text-2xl font-black uppercase text-red-500">
                Access Denied
              </h1>

              <p className="mt-3 text-xs font-bold uppercase text-zinc-500">
                Halaman ini hanya untuk admin.
              </p>
            </div>
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="custom-scrollbar flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(83,252,24,1)]">
            <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
              // ADMIN CONTROL CENTER
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
              Admin Panel
            </h1>

            <p className="mt-3 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
              Kelola announcement global MABAR.CU tanpa Socket.IO. Setelah
              publish, user akan melihat announcement lewat polling.
            </p>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#191B1F] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {message}
            </div>
          )}

          <div className="mt-10 grid gap-8 xl:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleCreateAnnouncement}
              className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Publish Announcement
              </h2>

              <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                Kosongkan waktu mulai/selesai jika ingin announcement aktif
                terus.
              </p>

              <div className="mt-6 space-y-5">
                <Input
                  label="Title"
                  value={announcement.title}
                  onChange={(value) =>
                    setAnnouncement((prev) => ({
                      ...prev,
                      title: value,
                    }))
                  }
                  placeholder="EVENT MLBB"
                />

                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Message
                  </span>

                  <textarea
                    value={announcement.message}
                    onChange={(e) =>
                      setAnnouncement((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="ARE YOU READY?"
                    className="mt-2 min-h-32 w-full border-2 border-black bg-[#191B1F] p-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
                  />
                </label>

                <Input
                  label="Starts At"
                  type="datetime-local"
                  value={announcement.starts_at}
                  onChange={(value) =>
                    setAnnouncement((prev) => ({
                      ...prev,
                      starts_at: value,
                    }))
                  }
                />

                <Input
                  label="Ends At"
                  type="datetime-local"
                  value={announcement.ends_at}
                  onChange={(value) =>
                    setAnnouncement((prev) => ({
                      ...prev,
                      ends_at: value,
                    }))
                  }
                />

                <button
                  disabled={saving}
                  className="h-12 w-full border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50"
                >
                  {saving ? "Publishing..." : "Publish Announcement"}
                </button>
              </div>
            </form>

            <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    Announcement Logs
                  </h2>

                  <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                    Data terbaru dari tabel announcements.
                  </p>
                </div>

                <button
                  onClick={loadData}
                  className="border-2 border-black bg-[#191B1F] px-4 py-2 text-xs font-black uppercase text-[#53FC18]"
                >
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="border-2 border-dashed border-black bg-[#191B1F] p-8 text-xs font-black uppercase text-zinc-500">
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className="border-2 border-dashed border-black bg-[#191B1F] p-8 text-xs font-black uppercase text-zinc-500">
                  Belum ada announcement.
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((item) => (
                    <div
                      key={item.id}
                      className={`border-2 border-black p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                        item.is_active
                          ? "bg-[#142A14]"
                          : "bg-[#191B1F] opacity-60"
                      }`}
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span
                              className={`border border-black px-2 py-1 text-[9px] font-black uppercase ${
                                item.is_active
                                  ? "bg-[#53FC18] text-black"
                                  : "bg-zinc-700 text-zinc-300"
                              }`}
                            >
                              {item.is_active ? "ACTIVE" : "INACTIVE"}
                            </span>

                            <span className="border border-black bg-black px-2 py-1 text-[9px] font-black uppercase text-[#53FC18]">
                              {item.id.slice(0, 8)}
                            </span>
                          </div>

                          <h3 className="truncate text-xl font-black uppercase tracking-tight">
                            {item.title}
                          </h3>

                          <p className="mt-2 break-words text-xs font-bold uppercase leading-relaxed text-zinc-400">
                            {item.message}
                          </p>

                          <div className="mt-4 grid gap-2 text-[10px] font-black uppercase text-zinc-500 sm:grid-cols-2">
                            <p>Start: {formatDate(item.starts_at)}</p>
                            <p>End: {formatDate(item.ends_at)}</p>
                            <p>Created: {formatDate(item.created_at)}</p>
                          </div>
                        </div>

                        {item.is_active && (
                          <button
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="border-2 border-black bg-red-600 px-4 py-3 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
      />
    </label>
  )
}