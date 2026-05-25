"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import AdminRoute from "@/components/auth/AdminRoute"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import {
  getAdminAnalytics,
  getAdminReports,
  getAdminUsers,
  banUser,
  unbanUser,
  muteUser,
  unmuteUser,
  createAnnouncement,
  getAdminAnnouncements,
  deleteAnnouncement,
} from "@/services/admin.service"
import {
  closeReport,
  getReportMessages,
  sendReportMessage,
} from "@/services/report.service"

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user)

  const [analytics, setAnalytics] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])

  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reportMessages, setReportMessages] = useState<any[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [message, setMessage] = useState("")

  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
    starts_at: "",
    ends_at: "",
  })

  async function loadData() {
    try {
      const [analyticsData, usersData, reportsData, announcementsData] =
        await Promise.all([
          getAdminAnalytics(),
          getAdminUsers(),
          getAdminReports(),
          getAdminAnnouncements(),
        ])

      setAnalytics(analyticsData)
      setUsers(usersData)
      setReports(reportsData)
      setAnnouncements(announcementsData)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil data admin")
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (!announcement.title.trim() || !announcement.message.trim()) {
        setMessage("Title dan message announcement wajib diisi.")
        return
      }

      await createAnnouncement({
        title: announcement.title,
        message: announcement.message,
        starts_at: announcement.starts_at || undefined,
        ends_at: announcement.ends_at || undefined,
      })

      setMessage("Announcement berhasil dibuat.")
      setAnnouncement({
        title: "",
        message: "",
        starts_at: "",
        ends_at: "",
      })

      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat announcement")
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    try {
      await deleteAnnouncement(id)
      setMessage("Announcement berhasil dinonaktifkan.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menghapus announcement")
    }
  }

  async function handleOpenReport(report: any) {
    try {
      if (selectedReport?.id) {
        socket.emit("leave_report", selectedReport.id)
      }

      setSelectedReport(report)
      setMessage("")

      const data = await getReportMessages(report.id)
      setReportMessages(data)

      if (!socket.connected) socket.connect()
      socket.emit("join_report", report.id)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuka report")
    }
  }

  async function handleReplyReport(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedReport?.id || !replyMessage.trim()) return

    try {
      await sendReportMessage(selectedReport.id, replyMessage)
      setReplyMessage("")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membalas report")
    }
  }

  async function handleCloseReport() {
    if (!selectedReport?.id) return

    try {
      await closeReport(selectedReport.id)
      socket.emit("leave_report", selectedReport.id)

      setSelectedReport(null)
      setReportMessages([])
      setMessage("Report berhasil ditutup.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menutup report")
    }
  }

  async function handleBanUser(userId: string) {
    const reason = prompt("Alasan ban:", "Melanggar aturan komunitas")
    if (!reason) return

    await banUser(userId, reason)
    await loadData()
  }

  async function handleMuteUser(userId: string) {
    const reason = prompt("Alasan mute:", "Toxic di chat komunitas")
    if (!reason) return

    await muteUser(userId, reason)
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    socket.connect()

    socket.on("admin_report_created", (report) => {
      setReports((prev) => {
        const exists = prev.some((item) => item.id === report.id)
        if (exists) return prev
        return [report, ...prev]
      })
    })

    socket.on("report_message_received", (newMessage) => {
      setReportMessages((prev) => {
        const exists = prev.some((item) => item.id === newMessage.id)
        if (exists) return prev

        if (selectedReport?.id && newMessage.report_id !== selectedReport.id) {
          return prev
        }

        return [...prev, newMessage]
      })
    })

    socket.on("report_closed", (closedReport) => {
      if (selectedReport?.id === closedReport.id) {
        setSelectedReport(null)
        setReportMessages([])
        setMessage("Report sudah ditutup.")
      }

      loadData()
    })

    return () => {
      socket.off("admin_report_created")
      socket.off("report_message_received")
      socket.off("report_closed")
    }
  }, [selectedReport?.id])

  return (
    <AdminRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-500">
              // ADMIN CONTROL CENTER
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight">
              Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
              Kelola user, laporan livechat, moderation, announcement, mute komunitas, dan aktivitas platform.
            </p>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18]">
              {message}
            </div>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Stat label="TOTAL USERS" value={analytics?.totalUsers ?? "..."} />
            <Stat label="ONLINE USERS" value={analytics?.onlineUsers ?? "..."} live />
            <Stat label="ACTIVE ROOMS" value={analytics?.activeRooms ?? "..."} />
            <Stat label="REPORTS" value={analytics?.reportsCount ?? reports.length} danger />
            <Stat label="MESSAGES TODAY" value={analytics?.messagesToday ?? "..."} />
          </div>

          <div className="mt-12 grid gap-6 xl:grid-cols-4">
            <AdminMenu title="USERS CONTROL" desc="Ban, unban, mute user." />
            <AdminMenu title="LIVE REPORTS" desc="Balas laporan user seperti livechat." />
            <AdminMenu title="MODERATION" desc="Review toxic chat dan image moderation." />
            <AdminMenu title="ANNOUNCEMENT" desc="Kirim pengumuman ke semua user." />
          </div>

          <form
            onSubmit={handleCreateAnnouncement}
            className="mt-12 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-2xl font-black uppercase">Create Announcement</h2>

            <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
              Kosongkan start/end time kalau ingin announcement langsung muncul.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                value={announcement.title}
                onChange={(e) =>
                  setAnnouncement((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="TITLE"
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />

              <input
                value={announcement.message}
                onChange={(e) =>
                  setAnnouncement((p) => ({ ...p, message: e.target.value }))
                }
                placeholder="MESSAGE"
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />

              <input
                type="datetime-local"
                value={announcement.starts_at}
                onChange={(e) =>
                  setAnnouncement((p) => ({ ...p, starts_at: e.target.value }))
                }
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />

              <input
                type="datetime-local"
                value={announcement.ends_at}
                onChange={(e) =>
                  setAnnouncement((p) => ({ ...p, ends_at: e.target.value }))
                }
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />
            </div>

            <button className="mt-6 border-2 border-black bg-[#53FC18] px-8 py-4 text-xs font-black uppercase text-black">
              Publish Announcement
            </button>
          </form>

          <section className="mt-8 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-6 text-2xl font-black uppercase">
              Announcement List
            </h2>

            {announcements.length === 0 ? (
              <div className="border-2 border-dashed border-black bg-[#191B1F] p-5 text-xs font-black uppercase text-zinc-500">
                Belum ada announcement.
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 border-2 border-black bg-[#191B1F] p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="text-sm font-black uppercase text-[#53FC18]">
                        {item.title}
                      </p>

                      <p className="mt-2 text-xs font-bold uppercase text-zinc-400">
                        {item.message}
                      </p>

                      <p className="mt-2 text-[10px] font-black uppercase text-zinc-500">
                        Active: {item.is_active ? "YES" : "NO"} • Start:{" "}
                        {item.starts_at
                          ? new Date(item.starts_at).toLocaleString("id-ID")
                          : "NOW"}{" "}
                        • End:{" "}
                        {item.ends_at
                          ? new Date(item.ends_at).toLocaleString("id-ID")
                          : "NO LIMIT"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="border-2 border-black bg-red-600 px-5 py-3 text-xs font-black uppercase text-white"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="mt-12 grid gap-8 xl:grid-cols-2">
            <section className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="mb-6 text-2xl font-black uppercase">
                User Control
              </h2>

              <div className="space-y-4">
                {users.map((item) => (
                  <div key={item.id} className="border-2 border-black bg-[#191B1F] p-4">
                    <p className="text-sm font-black uppercase">
                      {item.email || item.username || item.id}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                      Role: {item.role || "user"} • Status: {item.status || "active"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleBanUser(item.id)}
                        className="border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase text-white"
                      >
                        Ban
                      </button>

                      <button
                        type="button"
                        onClick={() => unbanUser(item.id).then(loadData)}
                        className="border-2 border-black bg-[#53FC18] px-4 py-2 text-xs font-black uppercase text-black"
                      >
                        Unban
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMuteUser(item.id)}
                        className="border-2 border-black bg-yellow-400 px-4 py-2 text-xs font-black uppercase text-black"
                      >
                        Mute Chat
                      </button>

                      <button
                        type="button"
                        onClick={() => unmuteUser(item.id).then(loadData)}
                        className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black"
                      >
                        Unmute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="mb-6 text-2xl font-black uppercase">
                Reports Livechat
              </h2>

              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#191B1F] p-6 text-xs font-black uppercase text-zinc-500">
                    Belum ada report.
                  </div>
                ) : (
                  reports.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => handleOpenReport(report)}
                      className={`w-full border-2 border-black p-4 text-left ${
                        selectedReport?.id === report.id
                          ? "bg-[#53FC18] text-black"
                          : "bg-[#191B1F] text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-black uppercase">
                          {report.title || "User Report"}
                        </p>

                        <span className="border border-black bg-black px-2 py-1 text-[10px] font-black uppercase text-[#53FC18]">
                          {report.status || "open"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-bold uppercase opacity-70">
                        {report.description || "-"}
                      </p>

                      <p className="mt-3 text-[10px] font-black uppercase opacity-60">
                        Reporter: {report.reporter_id || "-"}
                      </p>

                      <p className="mt-1 text-[10px] font-black uppercase">
                        {report.created_at
                          ? new Date(report.created_at).toLocaleString("id-ID")
                          : "-"}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {selectedReport && (
            <section className="mt-12 border-2 border-black bg-[#0E1318] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col justify-between gap-4 border-b-2 border-black bg-[#191B1F] p-5 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase text-[#53FC18]">
                    Livechat Report
                  </h2>

                  <p className="mt-1 text-xs font-black uppercase text-zinc-500">
                    {selectedReport.title} • Status: {selectedReport.status}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseReport}
                  className="border-2 border-black bg-red-600 px-5 py-3 text-xs font-black uppercase text-white"
                >
                  Close Report
                </button>
              </div>

              <div className="h-[420px] space-y-4 overflow-y-auto p-6">
                {reportMessages.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#191B1F] p-6 text-xs font-black uppercase text-zinc-500">
                    Belum ada pesan.
                  </div>
                ) : (
                  reportMessages.map((item) => {
                    const mine = item.sender_id === user?.id

                    return (
                      <div
                        key={item.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xl border-2 border-black p-4 ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#191B1F] text-white"
                          }`}
                        >
                          <p className="mb-2 text-[10px] font-black uppercase opacity-70">
                            {item.sender_role}
                          </p>

                          <p className="text-xs font-bold uppercase leading-relaxed">
                            {item.message}
                          </p>

                          <p className="mt-2 text-[9px] font-black uppercase opacity-50">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString("id-ID")
                              : ""}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form onSubmit={handleReplyReport} className="border-t-2 border-black p-4">
                <div className="flex gap-3">
                  <input
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="BALAS REPORT USER..."
                    className="h-14 flex-1 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
                  />

                  <button className="border-2 border-black bg-[#53FC18] px-8 text-xs font-black uppercase text-black">
                    Send
                  </button>
                </div>
              </form>
            </section>
          )}
        </section>
      </main>
    </AdminRoute>
  )
}

function Stat({
  label,
  value,
  live,
  danger,
}: {
  label: string
  value: string | number
  live?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        danger
          ? "bg-red-950/40 text-red-400"
          : live
            ? "bg-[#142A14] text-[#53FC18]"
            : "bg-[#0E1318]"
      }`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-4xl font-black">{value}</h2>
        {live && <span className="h-2 w-2 animate-pulse bg-[#53FC18]" />}
      </div>

      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function AdminMenu({
  title,
  desc,
}: {
  title: string
  desc: string
}) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-lg font-black uppercase">{title}</h3>
      <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
        {desc}
      </p>
    </div>
  )
}