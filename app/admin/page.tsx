"use client"

import { useEffect, useState, useRef } from "react"
import Sidebar from "@/components/layout/Sidebar"
import AdminRoute from "@/components/auth/AdminRoute"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import {
  AlertTriangle,
  ShieldAlert,
  MessageSquare,
  Megaphone,
  Users,
  Activity,
  Trophy,
  Terminal,
  Clock,
  Trash2,
} from "lucide-react"
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
  createTournament,
  deleteTournament,
} from "@/services/admin.service"
import {
  closeReport,
  getReportMessages,
  sendReportMessage,
} from "@/services/report.service"
import { getGames } from "@/services/game.service"
import { getTournaments } from "@/services/tournament.service"

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user)

  const [analytics, setAnalytics] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])

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

  const [tournamentForm, setTournamentForm] = useState({
    title: "",
    description: "",
    banner_url: "",
    game_id: "",
    date: "",
    prize: "",
    max_players: 128,
  })

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    type: "ban" | "unban" | "mute" | "unmute" | null
    targetUser: { id: string; name: string } | null
    reason: string
  }>({
    isOpen: false,
    type: null,
    targetUser: null,
    reason: "",
  })

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight
    }
  }, [reportMessages])

  async function loadData() {
    try {
      const [
        analyticsData,
        usersData,
        reportsData,
        announcementsData,
        gamesData,
        tournamentsData,
      ] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers(),
        getAdminReports(),
        getAdminAnnouncements(),
        getGames(),
        getTournaments(),
      ])

      setAnalytics(analyticsData)
      setUsers(usersData || [])
      setReports(reportsData || [])
      setAnnouncements(
        Array.isArray(announcementsData)
          ? announcementsData
          : announcementsData?.announcements || []
      )
      setGames(gamesData || [])
      setTournaments(tournamentsData || [])
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal sinkronisasi data pusat.")
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault()

    try {
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

      setMessage("Broadcast system baru berhasil dipancarkan.")
      setAnnouncement({
        title: "",
        message: "",
        starts_at: "",
        ends_at: "",
      })

      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat pengumuman.")
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id))

    try {
      await deleteAnnouncement(id)
      setMessage("Pengumuman berhasil dihentikan/dihapus.")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menghapus pengumuman.")
      await loadData()
    }
  }

  async function handleCreateTournament(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (!tournamentForm.title.trim() || !tournamentForm.game_id) {
        setMessage("Judul Turnamen dan Kategori Game wajib diisi.")
        return
      }

      await createTournament(tournamentForm)

      setMessage(`Turnamen [${tournamentForm.title}] berhasil dibuka!`)
      setTournamentForm({
        title: "",
        description: "",
        banner_url: "",
        game_id: "",
        date: "",
        prize: "",
        max_players: 128,
      })

      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat turnamen.")
    }
  }

  async function handleDeleteTournament(id: string) {
    setTournaments((prev) => prev.filter((item) => item.id !== id))

    try {
      await deleteTournament(id)
      setMessage("Registrasi Turnamen berhasil ditutup & dihapus.")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menghapus turnamen.")
      await loadData()
    }
  }

  async function handleOpenReport(report: any) {
    try {
      if (selectedReport?.id) {
        socket.emit("leave_report", selectedReport.id)
      }

      setSelectedReport(report)

      const data = await getReportMessages(report.id)
      setReportMessages(data || [])

      if (!socket.connected) socket.connect()
      socket.emit("join_report", report.id)
    } catch {
      setMessage("Gagal membuka enkripsi report terminal.")
    }
  }

  async function handleReplyReport(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedReport?.id || !replyMessage.trim()) return

    try {
      await sendReportMessage(selectedReport.id, replyMessage)
      setReplyMessage("")
    } catch {
      setMessage("Transmisi pesan report gagal.")
    }
  }

  async function handleCloseReport() {
    if (!selectedReport?.id) return

    try {
      await closeReport(selectedReport.id)
      socket.emit("leave_report", selectedReport.id)

      setSelectedReport(null)
      setReportMessages([])
      setMessage("Tiket laporan berhasil diselesaikan.")

      await loadData()
    } catch {
      setMessage("Gagal merubah status laporan.")
    }
  }

  const openModerationModal = (
    type: "ban" | "unban" | "mute" | "unmute",
    userId: string,
    identifier: string
  ) => {
    setModalConfig({
      isOpen: true,
      type,
      targetUser: {
        id: userId,
        name: identifier,
      },
      reason:
        type === "ban"
          ? "Melanggar aturan komunitas"
          : type === "mute"
            ? "Toxic di chat komunitas"
            : "",
    })
  }

  const closeModerationModal = () => {
    setModalConfig({
      isOpen: false,
      type: null,
      targetUser: null,
      reason: "",
    })
  }

  const handleExecuteModeration = async () => {
    const { type, targetUser, reason } = modalConfig

    if (!targetUser) return

    try {
      if (type === "ban") await banUser(targetUser.id, reason)
      else if (type === "unban") await unbanUser(targetUser.id)
      else if (type === "mute") await muteUser(targetUser.id, reason)
      else if (type === "unmute") await unmuteUser(targetUser.id)

      setMessage(`Aksi Moderasi [${type}] berhasil dieksekusi pada target.`)
      closeModerationModal()
      await loadData()
    } catch {
      setMessage("Gagal memproses aksi moderasi.")
      closeModerationModal()
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    socket.connect()

    socket.on("admin_report_created", (report) => {
      setReports((prev) => {
        if (prev.some((item) => item.id === report.id)) return prev
        return [report, ...prev]
      })
    })

    socket.on("report_message_received", (newMessage) => {
      setReportMessages((prev) => {
        if (prev.some((item) => item.id === newMessage.id)) return prev
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
      <main className="flex min-h-screen bg-[#07090C] font-mono text-white selection:bg-[#53FC18] selection:text-black">
        <Sidebar />

        <section className="flex-1 space-y-10 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="relative overflow-hidden border-4 border-black bg-[#0E1318] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute right-0 top-0 hidden select-none p-2 text-[8px] opacity-10 md:block">
              SYS_LOAD_OK // LEVEL_0_AUTH
            </div>

            <div className="mb-3 inline-flex items-center gap-2 border border-red-500 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-500">
              <Terminal size={14} className="animate-pulse" />
              <span>// CENTRAL ROOT CONTROL OVERRIDE</span>
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
              MASTER DASHBOARD
            </h1>

            <p className="mt-3 max-w-3xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
              Gerbang kendali terenkripsi: eksekusi ban/mute user, audit
              livechat report, manajemen turnamen esports, dan peluncuran global
              banner announcement real-time.
            </p>
          </div>

          {message && (
            <div className="flex items-center justify-between border-4 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping bg-[#53FC18]" />
                <span>⚡ CORE_LOG: {message}</span>
              </span>

              <button
                onClick={() => setMessage("")}
                className="border border-black bg-black px-2 py-0.5 text-white hover:bg-neutral-900"
              >
                ACKNOWLEDGE
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <Stat
              label="TOTAL USERS"
              value={analytics?.totalUsers ?? "..."}
              icon={<Users size={20} />}
            />
            <Stat
              label="ONLINE TARGETS"
              value={analytics?.onlineUsers ?? "..."}
              live
              icon={<Activity size={20} />}
            />
            <Stat
              label="ACTIVE ROOMS"
              value={analytics?.activeRooms ?? "..."}
              icon={<MessageSquare size={20} />}
            />
            <Stat
              label="PENDING REPORTS"
              value={analytics?.reportsCount ?? reports.length}
              danger
              icon={<ShieldAlert size={20} />}
            />
            <Stat
              label="TOURNAMENTS LIVE"
              value={tournaments.length}
              icon={<Trophy size={20} />}
            />
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
                <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                  <Users size={22} className="text-[#53FC18]" />
                  USER REGISTRY REGULATION
                </h2>

                <span className="border border-black bg-zinc-900 px-3 py-1 text-xs font-black text-zinc-400">
                  {users.length} LOADED
                </span>
              </div>

              <div className="custom-scrollbar max-h-[600px] space-y-4 overflow-y-auto pr-2">
                {users.map((item) => {
                  const userIdentifier =
                    item.email || item.profiles?.username || item.id
                  const isBanned = item.status === "banned"
                  const isMuted = item.is_muted === true

                  return (
                    <div
                      key={item.id}
                      className={`border-2 border-black p-4 transition-all ${
                        isBanned
                          ? "border-red-600 bg-[#251212] shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                          : isMuted
                            ? "border-yellow-500 bg-[#221C11] shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]"
                            : "bg-[#131920] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="truncate">
                          <p
                            className={`truncate text-sm font-black uppercase tracking-wide ${
                              isBanned
                                ? "text-red-400"
                                : isMuted
                                  ? "text-yellow-400"
                                  : "text-[#53FC18]"
                            }`}
                          >
                            {userIdentifier}
                          </p>

                          <p className="mt-0.5 text-[10px] font-bold uppercase text-zinc-500">
                            ALIAS: {item.profiles?.display_name || "-"}
                          </p>
                        </div>

                        <span
                          className={`border px-2 py-0.5 text-[9px] font-black uppercase ${
                            isBanned
                              ? "border-red-800 bg-red-950 text-red-400"
                              : isMuted
                                ? "border-yellow-800 bg-yellow-950 text-yellow-500"
                                : "border-green-800 bg-green-950 text-[#53FC18]"
                          }`}
                        >
                          {isBanned ? "BANNED" : isMuted ? "MUTED" : "ACTIVE"}
                        </span>
                      </div>

                      {isBanned && item.banned_reason && (
                        <p className="mt-2 border border-red-900/50 bg-black/40 p-2 text-[10px] font-bold uppercase text-red-400">
                          CRIME_LOG: {item.banned_reason}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/20 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            openModerationModal(
                              isBanned ? "unban" : "ban",
                              item.id,
                              userIdentifier
                            )
                          }
                          className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                            isBanned
                              ? "bg-[#53FC18] text-black hover:bg-green-400"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {isBanned ? "🔓 Unban Target" : "🚫 Ban Account"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openModerationModal(
                              isMuted ? "unmute" : "mute",
                              item.id,
                              userIdentifier
                            )
                          }
                          className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                            isMuted
                              ? "bg-white text-black hover:bg-zinc-200"
                              : "bg-yellow-500 text-black hover:bg-yellow-600"
                          }`}
                        >
                          {isMuted ? "🔊 Unmute Feed" : "🔇 Mute Comms"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="flex flex-col justify-between border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
                  <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                    <ShieldAlert
                      size={22}
                      className="animate-pulse text-red-500"
                    />
                    LIVE CRYPT REPORT FEED
                  </h2>
                </div>

                <div className="custom-scrollbar max-h-[600px] space-y-3 overflow-y-auto pr-2">
                  {reports.length === 0 ? (
                    <div className="border-4 border-dashed border-zinc-800 bg-[#131920] p-12 text-center text-xs font-black uppercase text-zinc-500">
                      SYS_LOG: Tidak ada tiket pelanggaran aktif ditemukan.
                    </div>
                  ) : (
                    reports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => handleOpenReport(report)}
                        className={`relative w-full border-2 border-black p-4 text-left transition-all ${
                          selectedReport?.id === report.id
                            ? "translate-x-[2px] translate-y-[2px] bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            : "bg-[#131920] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-zinc-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-xs font-black uppercase tracking-wide">
                            {report.title || "INCIDENT REPORT"}
                          </p>

                          <span
                            className={`border border-black px-2 py-0.5 text-[9px] font-black uppercase ${
                              selectedReport?.id === report.id
                                ? "bg-black text-[#53FC18]"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            {report.status || "OPEN"}
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-1 text-[11px] font-bold uppercase opacity-80">
                          {report.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2 text-[8px] font-black opacity-60">
                          <span>
                            UID: {report.reporter_id?.substring(0, 8)}...
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {report.created_at
                              ? new Date(report.created_at).toLocaleTimeString(
                                  "id-ID"
                                )
                              : "-"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

          {selectedReport && (
            <section className="border-4 border-black bg-[#0E1318] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col justify-between gap-4 border-b-4 border-black bg-[#131920] p-5 md:flex-row md:items-center">
                <div>
                  <div className="mb-1 inline-flex items-center gap-1 bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                    CRITICAL INTERCEPT
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight text-[#53FC18]">
                    {selectedReport.title}
                  </h3>

                  <p className="mt-0.5 text-[10px] font-bold uppercase text-zinc-500">
                    TICKET GUID: {selectedReport.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCloseReport}
                  className="border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  🛑 Close Laporan & Selesaikan
                </button>
              </div>

              <div className="grid bg-[#07090C] md:grid-cols-3">
                <div className="space-y-3 border-b-2 border-black bg-black/30 p-5 md:border-b-0 md:border-r-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    // KRONOLOGI LAPORAN
                  </h4>

                  <div className="max-h-[300px] overflow-y-auto border border-zinc-800 bg-black/60 p-4 text-xs font-bold uppercase leading-relaxed text-zinc-300">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="flex h-[380px] flex-col justify-between md:col-span-2">
                  <div
                    ref={chatContainerRef}
                    className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-5"
                  >
                    {reportMessages.length === 0 ? (
                      <div className="mt-10 text-center text-[10px] font-black uppercase text-zinc-600">
                        SISTEM: Menunggu jabat tangan data dari pelapor...
                      </div>
                    ) : (
                      reportMessages.map((item) => {
                        const mine = item.sender_id === user?.id

                        return (
                          <div
                            key={item.id}
                            className={`flex ${
                              mine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-md border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                mine
                                  ? "bg-[#53FC18] text-black"
                                  : "border-zinc-800 bg-[#131920] text-white"
                              }`}
                            >
                              <p className="mb-0.5 text-[8px] font-black uppercase opacity-60">
                                {mine
                                  ? "⚡ CONSOLE_ADMIN_OVERRIDE"
                                  : "🔴 INVESTIGATED_TARGET_USER"}
                              </p>

                              <p className="break-words text-xs font-bold uppercase leading-snug">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <form
                    onSubmit={handleReplyReport}
                    className="flex gap-2 border-t-2 border-black bg-[#0E1318] p-3"
                  >
                    <input
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Ketik instruksi penyelesaian laporan..."
                      className="h-12 flex-1 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />

                    <button className="border-2 border-black bg-[#53FC18] px-6 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                      TRANSMIT
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          <div className="grid gap-10 lg:grid-cols-2">
            <section className="space-y-6">
              <form
                onSubmit={handleCreateAnnouncement}
                className="space-y-4 border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                  <Megaphone size={22} className="text-[#53FC18]" />
                  SYSTEM BROADCAST MODULATOR
                </h2>

                <div className="grid gap-4">
                  <input
                    value={announcement.title}
                    onChange={(e) =>
                      setAnnouncement((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                    placeholder="ANNOUNCEMENT CRITICAL HEADLINE"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-[#53FC18]"
                  />

                  <textarea
                    value={announcement.message}
                    onChange={(e) =>
                      setAnnouncement((p) => ({
                        ...p,
                        message: e.target.value,
                      }))
                    }
                    placeholder="DETAILED BROADCAST LOG MESSAGE CONTENT..."
                    className="h-20 resize-none border-2 border-black bg-[#131920] p-4 text-xs font-black uppercase outline-none focus:border-[#53FC18]"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-[8px] font-black uppercase text-zinc-500">
                        SCHEDULER START TIME
                      </label>

                      <input
                        type="datetime-local"
                        value={announcement.starts_at}
                        onChange={(e) =>
                          setAnnouncement((p) => ({
                            ...p,
                            starts_at: e.target.value,
                          }))
                        }
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-[#53FC18]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[8px] font-black uppercase text-zinc-500">
                        AUTO DESTRUCTION TIME
                      </label>

                      <input
                        type="datetime-local"
                        value={announcement.ends_at}
                        onChange={(e) =>
                          setAnnouncement((p) => ({
                            ...p,
                            ends_at: e.target.value,
                          }))
                        }
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-[#53FC18]"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]">
                  📣 PULSE LIVE ANNOUNCEMENT
                </button>
              </form>

              <div className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-4 text-md font-black uppercase tracking-widest text-zinc-400">
                  // ACTIVE SYSTEM REGISTRY
                </h3>

                <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {announcements.length === 0 ? (
                    <div className="py-8 text-center text-xs font-black uppercase text-zinc-600">
                      REGISTRY_EMPTY // NO DATA
                    </div>
                  ) : (
                    announcements.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 border-2 border-black bg-[#131920] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="truncate">
                          <p className="truncate text-xs font-black uppercase text-[#53FC18]">
                            {item.title}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] uppercase text-zinc-500">
                            {item.message}
                          </p>

                          <p className="mt-1 text-[8px] font-black uppercase text-zinc-600">
                            {item.is_active ? "ACTIVE" : "INACTIVE"} •{" "}
                            {item.created_at
                              ? new Date(item.created_at).toLocaleString("id-ID")
                              : "NO DATE"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="border border-black bg-red-600 p-2 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700"
                          title="Hapus Instan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <form
                onSubmit={handleCreateTournament}
                className="space-y-4 border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              >
                <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
                  <Trophy size={22} className="text-yellow-500" />
                  TOURNAMENT REGISTRATION CORE
                </h2>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={tournamentForm.title}
                      onChange={(e) =>
                        setTournamentForm((p) => ({
                          ...p,
                          title: e.target.value,
                        }))
                      }
                      placeholder="TOURNAMENT EVENT NAME"
                      className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                    />

                    <select
                      value={tournamentForm.game_id}
                      onChange={(e) =>
                        setTournamentForm((p) => ({
                          ...p,
                          game_id: e.target.value,
                        }))
                      }
                      className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase text-zinc-400 outline-none focus:border-yellow-500"
                    >
                      <option value="">-- SELECT GAME MATCH --</option>
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={tournamentForm.description}
                    onChange={(e) =>
                      setTournamentForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="SHORT TOURNAMENT RULES / OVERVIEW"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                  />

                  <input
                    value={tournamentForm.banner_url}
                    onChange={(e) =>
                      setTournamentForm((p) => ({
                        ...p,
                        banner_url: e.target.value,
                      }))
                    }
                    placeholder="BANNER POSTER URL STATIC IMAGE"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1 block text-[8px] font-black uppercase text-zinc-500">
                        MATCH DATE
                      </label>

                      <input
                        type="date"
                        value={tournamentForm.date}
                        onChange={(e) =>
                          setTournamentForm((p) => ({
                            ...p,
                            date: e.target.value,
                          }))
                        }
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[8px] font-black uppercase text-zinc-500">
                        TOTAL PRIZE POOL
                      </label>

                      <input
                        value={tournamentForm.prize}
                        onChange={(e) =>
                          setTournamentForm((p) => ({
                            ...p,
                            prize: e.target.value,
                          }))
                        }
                        placeholder="RP 10.000.000"
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black uppercase outline-none focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[8px] font-black uppercase text-zinc-500">
                        MAX CAPACITY PLOTS
                      </label>

                      <input
                        type="number"
                        value={tournamentForm.max_players}
                        onChange={(e) =>
                          setTournamentForm((p) => ({
                            ...p,
                            max_players: parseInt(e.target.value) || 128,
                          }))
                        }
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full border-2 border-black bg-yellow-500 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400">
                  🏆 AUTHORIZE NEW TOURNAMENT EVENT
                </button>
              </form>

              <div className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="mb-4 text-md font-black uppercase tracking-widest text-zinc-400">
                  // LIVE BRUTAL ESPORTS TOURNAMENTS
                </h3>

                <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
                  {tournaments.length === 0 ? (
                    <div className="py-8 text-center text-xs font-black uppercase text-zinc-600">
                      NO_TOURNAMENTS_FOUND // GATEWAY_OPEN
                    </div>
                  ) : (
                    tournaments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 border-2 border-black bg-[#131920] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="truncate">
                          <p className="flex items-center gap-1.5 truncate text-xs font-black uppercase text-yellow-500">
                            <span>{item.title}</span>
                          </p>

                          <p className="mt-0.5 truncate text-[10px] uppercase text-zinc-400">
                            PRIZE: {item.prize || "FREE ENTRY"} • MAX:{" "}
                            {item.max_players} SLOTS
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(item.id)}
                          className="border border-black bg-red-600 p-2 text-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700"
                          title="Hapus Turnamen"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-6 font-mono text-white shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-red-500">
              <AlertTriangle size={28} className="animate-bounce stroke-[2.5]" />

              <h3 className="text-lg font-black uppercase tracking-tight">
                MODERATION OVERRIDE SYSTEM
              </h3>
            </div>

            <div className="my-5 space-y-3 text-xs uppercase">
              <p className="font-black text-zinc-500">TARGET ACCOUNT SIGNATURE:</p>

              <div className="break-all border border-zinc-800 bg-black p-3 text-xs font-black text-red-400">
                {modalConfig.targetUser?.name}
              </div>

              {modalConfig.type === "ban" || modalConfig.type === "mute" ? (
                <div>
                  <label className="mb-1.5 block font-black text-zinc-400">
                    REASON SPECIFICATION (REQUIRED):
                  </label>

                  <input
                    type="text"
                    value={modalConfig.reason}
                    onChange={(e) =>
                      setModalConfig((p) => ({
                        ...p,
                        reason: e.target.value,
                      }))
                    }
                    className="h-12 w-full border-2 border-black bg-[#131920] px-3 font-bold uppercase text-white outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <p className="border border-zinc-800 bg-zinc-900 p-3 font-bold leading-relaxed text-zinc-300">
                  Apakah Anda menyetujui pemulihan total terhadap regulasi hak
                  akses akun user ini?
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={closeModerationModal}
                className="h-12 border-2 border-black bg-zinc-800 text-xs font-black uppercase"
              >
                ABORT
              </button>

              <button
                onClick={handleExecuteModeration}
                disabled={
                  (modalConfig.type === "ban" ||
                    modalConfig.type === "mute") &&
                  !modalConfig.reason.trim()
                }
                className={`h-12 border-2 border-black text-xs font-black uppercase disabled:opacity-30 ${
                  modalConfig.type === "ban"
                    ? "bg-red-600 text-white"
                    : modalConfig.type === "mute"
                      ? "bg-yellow-500 text-black"
                      : "bg-[#53FC18] text-black"
                }`}
              >
                COMMIT {modalConfig.type}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminRoute>
  )
}

function Stat({
  label,
  value,
  live,
  danger,
  icon,
}: {
  label: string
  value: string | number
  live?: boolean
  danger?: boolean
  icon: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col justify-between border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
        danger
          ? "border-red-900/80 bg-red-950/30 text-red-400"
          : live
            ? "border-green-900/80 bg-[#102210] text-[#53FC18]"
            : "bg-[#0E1318]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-black tracking-tighter md:text-4xl">
            {value}
          </h2>

          {live && <span className="h-2 w-2 animate-ping rounded-full bg-[#53FC18]" />}
        </div>

        <div className="text-zinc-400 opacity-30">{icon}</div>
      </div>

      <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  )
}