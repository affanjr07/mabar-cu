"use client"

import { useEffect, useState, useRef } from "react"
import Sidebar from "@/components/layout/Sidebar"
import AdminRoute from "@/components/auth/AdminRoute"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import { 
  AlertTriangle, ShieldAlert, VolumeX, MessageSquare, Megaphone, 
  Users, Activity, Trophy, Calendar, Plus, Trash2, ShieldCheck, 
  Terminal, Radio, Clock, ArrowRight 
} from "lucide-react"
import {
  getAdminAnalytics, getAdminReports, getAdminUsers, banUser, 
  unbanUser, muteUser, unmuteUser, createAnnouncement, 
  getAdminAnnouncements, deleteAnnouncement, createTournament, deleteTournament
} from "@/services/admin.service"
import { closeReport, getReportMessages, sendReportMessage } from "@/services/report.service"
import { getGames } from "@/services/game.service"
import { getTournaments } from "@/services/tournament.service"

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user)

  // Data States
  const [analytics, setAnalytics] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])

  // Livechat Logic States
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [reportMessages, setReportMessages] = useState<any[]>([])
  const [replyMessage, setReplyMessage] = useState("")
  const [message, setMessage] = useState("")

  // Form States
  const [announcement, setAnnouncement] = useState({ title: "", message: "", starts_at: "", ends_at: "" })
  const [tournamentForm, setTournamentForm] = useState({
    title: "", description: "", banner_url: "", game_id: "", date: "", prize: "", max_players: 128
  })

  // Modal UI State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean; type: "ban" | "unban" | "mute" | "unmute" | null;
    targetUser: { id: string; name: string } | null; reason: string;
  }>({ isOpen: false, type: null, targetUser: null, reason: "" })

  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [reportMessages])

  async function loadData() {
    try {
      const [analyticsData, usersData, reportsData, announcementsData, gamesData, tournamentsData] =
        await Promise.all([
          getAdminAnalytics(),
          getAdminUsers(),
          getAdminReports(),
          getAdminAnnouncements(),
          getGames(),
          getTournaments()
        ])

      setAnalytics(analyticsData)
      setUsers(usersData)
      setReports(reportsData)
      setAnnouncements(announcementsData || [])
      setGames(gamesData || [])
      setTournaments(tournamentsData || [])
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal sinkronisasi data pusat.")
    }
  }

  // --- ANNOUNCEMENT HANDLERS ---
  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (!announcement.title.trim() || !announcement.message.trim()) {
        setMessage("Title dan message wajib diisi.")
        return
      }
      await createAnnouncement({
        title: announcement.title,
        message: announcement.message,
        starts_at: announcement.starts_at || undefined,
        ends_at: announcement.ends_at || undefined,
      })
      setMessage("Broadcast system baru berhasil dipancarkan.")
      setAnnouncement({ title: "", message: "", starts_at: "", ends_at: "" })
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat pengumuman.")
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    // OPTIMASI INSTAN: Hapus dari list di UI langsung agar tidak mematangkan beban loading re-render
    setAnnouncements((prev) => prev.filter((item) => item.id !== id))
    try {
      await deleteAnnouncement(id)
      setMessage("Pengumuman berhasil dihentikan/dihapus.")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menghapus pengumuman.")
      await loadData() // Rollback jika backend gagal
    }
  }

  // --- TOURNAMENT HANDLERS ---
  async function handleCreateTournament(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (!tournamentForm.title.trim() || !tournamentForm.game_id) {
        setMessage("Judul Turnamen dan Kategori Game wajib diisi.")
        return
      }
      await createTournament(tournamentForm)
      setMessage(`Turnamen [${tournamentForm.title}] berhasil dibuka!`)
      setTournamentForm({ title: "", description: "", banner_url: "", game_id: "", date: "", prize: "", max_players: 128 })
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

  // --- REPORT LIVECHAT HANDLERS ---
  async function handleOpenReport(report: any) {
    try {
      if (selectedReport?.id) {
        socket.emit("leave_report", selectedReport.id)
      }
      setSelectedReport(report)
      const data = await getReportMessages(report.id)
      setReportMessages(data)

      if (!socket.connected) socket.connect()
      socket.emit("join_report", report.id)
    } catch (error: any) {
      setMessage("Gagal membuka enkripsi report terminal.")
    }
  }

  async function handleReplyReport(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedReport?.id || !replyMessage.trim()) return
    try {
      await sendReportMessage(selectedReport.id, replyMessage)
      setReplyMessage("")
    } catch (error: any) {
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
    } catch (error: any) {
      setMessage("Gagal merubah status laporan.")
    }
  }

  // --- MODERATION MODALS LOGIC ---
  const openModerationModal = (type: "ban" | "unban" | "mute" | "unmute", userId: string, identifier: string) => {
    setModalConfig({
      isOpen: true, type, targetUser: { id: userId, name: identifier },
      reason: type === "ban" ? "Melanggar aturan komunitas" : type === "mute" ? "Toxic di chat komunitas" : "",
    })
  }

  const closeModerationModal = () => {
    setModalConfig({ isOpen: false, type: null, targetUser: null, reason: "" })
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
    } catch (error: any) {
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
        if (selectedReport?.id && newMessage.report_id !== selectedReport.id) return prev
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

        <section className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 space-y-10">
          
          {/* HEADER TERMINAL */}
          <div className="relative overflow-hidden border-4 border-black bg-[#0E1318] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute top-0 right-0 p-2 text-[8px] opacity-10 select-none hidden md:block">
              SYS_LOAD_OK // LEVEL_0_AUTH
            </div>
            <div className="mb-3 inline-flex items-center gap-2 border border-red-500 bg-red-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-red-500">
              <Terminal size={14} className="animate-pulse" />
              <span>// CENTRAL ROOT CONTROL OVERRIDE</span>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">MASTER DASHBOARD</h1>
            <p className="mt-3 max-w-3xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
              Gerbang kendali terenkripsi: eksekusi ban/mute user, audit livechat report, manajemen turnamen esports, dan peluncuran global banner announcement real-time.
            </p>
          </div>

          {/* SYSTEM ALERTS NOTIFICATION */}
          {message && (
            <div className="border-4 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between animate-in fade-in zoom-in-95">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 animate-ping bg-[#53FC18]" />
                <span>⚡ CORE_LOG: {message}</span>
              </span>
              <button onClick={() => setMessage("")} className="border border-black bg-black px-2 py-0.5 text-white hover:bg-neutral-900">ACKNOWLEDGE</button>
            </div>
          )}

          {/* STATS RACK GRID */}
          <div className="grid gap-4 grid-cols-2 xl:grid-cols-5">
            <Stat label="TOTAL USERS" value={analytics?.totalUsers ?? "..."} icon={<Users size={20} />} />
            <Stat label="ONLINE TARGETS" value={analytics?.onlineUsers ?? "..."} live icon={<Activity size={20} />} />
            <Stat label="ACTIVE ROOMS" value={analytics?.activeRooms ?? "..."} icon={<MessageSquare size={20} />} />
            <Stat label="PENDING REPORTS" value={analytics?.reportsCount ?? reports.length} danger icon={<ShieldAlert size={20} />} />
            <Stat label="TOURNAMENTS LIVE" value={tournaments.length} icon={<Trophy size={20} />} />
          </div>

          {/* SECTION: TWO COLUMN USER CONTROL & REPORTS MONITOR */}
          <div className="grid gap-8 xl:grid-cols-2">
            
            {/* USER SYSTEM ACCESSIBILITY */}
            <section className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Users size={22} className="text-[#53FC18]" /> USER REGISTRY REGULATION
                </h2>
                <span className="bg-zinc-900 border border-black px-3 py-1 text-xs font-black text-zinc-400">
                  {users.length} LOADED
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {users.map((item) => {
                  const userIdentifier = item.email || item.profiles?.username || item.id
                  const isBanned = item.status === "banned"
                  const isMuted = item.is_muted === true

                  return (
                    <div 
                      key={item.id} 
                      className={`border-2 border-black p-4 transition-all ${
                        isBanned ? "bg-[#251212] border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]" : 
                        isMuted ? "bg-[#221C11] border-yellow-500 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]" : 
                        "bg-[#131920] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="truncate">
                          <p className={`text-sm font-black uppercase tracking-wide truncate ${isBanned ? "text-red-400" : isMuted ? "text-yellow-400" : "text-[#53FC18]"}`}>
                            {userIdentifier}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">
                            ALIAS: {item.profiles?.display_name || "-"}
                          </p>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                          isBanned ? "bg-red-950 text-red-400 border-red-800" : 
                          isMuted ? "bg-yellow-950 text-yellow-500 border-yellow-800" : 
                          "bg-green-950 text-[#53FC18] border-green-800"
                        }`}>
                          {isBanned ? "BANNED" : isMuted ? "MUTED" : "ACTIVE"}
                        </span>
                      </div>

                      {isBanned && item.banned_reason && (
                        <p className="mt-2 text-[10px] text-red-400 bg-black/40 p-2 border border-red-900/50 font-bold uppercase">
                          CRIME_LOG: {item.banned_reason}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/20 pt-3">
                        <button
                          type="button"
                          onClick={() => openModerationModal(isBanned ? "unban" : "ban", item.id, userIdentifier)}
                          className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                            isBanned ? "bg-[#53FC18] text-black hover:bg-green-400" : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {isBanned ? "🔓 Unban Target" : "🚫 Ban Account"}
                        </button>
                        <button
                          type="button"
                          onClick={() => openModerationModal(isMuted ? "unmute" : "mute", item.id, userIdentifier)}
                          className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] ${
                            isMuted ? "bg-white text-black hover:bg-zinc-200" : "bg-yellow-500 text-black hover:bg-yellow-600"
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

            {/* LIVECHAT REPORT TERMINAL COMPONENT */}
            <section className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <div className="mb-6 flex items-center justify-between border-b-4 border-black pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                    <ShieldAlert size={22} className="text-red-500 animate-pulse" /> LIVE CRYPT REPORT FEED
                  </h2>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
                        className={`w-full border-2 border-black p-4 text-left transition-all relative ${
                          selectedReport?.id === report.id
                            ? "bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]"
                            : "bg-[#131920] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:border-zinc-500"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-black uppercase tracking-wide truncate">{report.title || "INCIDENT REPORT"}</p>
                          <span className={`border border-black px-2 py-0.5 text-[9px] font-black uppercase ${
                            selectedReport?.id === report.id ? "bg-black text-[#53FC18]" : "bg-red-600 text-white"
                          }`}>
                            {report.status || "OPEN"}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] font-bold uppercase opacity-80 line-clamp-1">{report.description}</p>
                        <div className="mt-3 flex justify-between items-center text-[8px] opacity-60 font-black border-t border-black/10 pt-2">
                          <span>UID: {report.reporter_id?.substring(0, 8)}...</span>
                          <span className="flex items-center gap-1"><Clock size={10}/> {report.created_at ? new Date(report.created_at).toLocaleTimeString("id-ID") : "-"}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* EXPANDED INTERACTIVE REPORT FEEDBACK DRAWER */}
          {selectedReport && (
            <section className="border-4 border-black bg-[#0E1318] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col justify-between gap-4 border-b-4 border-black bg-[#131920] p-5 md:flex-row md:items-center">
                <div>
                  <div className="inline-flex items-center gap-1 bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase text-white mb-1">
                    CRITICAL INTERCEPT
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#53FC18]">{selectedReport.title}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">TICKET GUID: {selectedReport.id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseReport}
                  className="border-2 border-black bg-red-600 px-4 py-2 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  🛑 Close Laporan & Selesaikan
                </button>
              </div>

              {/* MESSAGE LOG TERMINAL GRID */}
              <div className="grid md:grid-cols-3 bg-[#07090C]">
                {/* Deskripsi Kronologi Laporan */}
                <div className="p-5 border-b-2 md:border-b-0 md:border-r-2 border-black bg-black/30 space-y-3">
                  <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">// KRONOLOGI LAPORAN</h4>
                  <div className="border border-zinc-800 bg-black/60 p-4 text-xs font-bold uppercase text-zinc-300 leading-relaxed max-h-[300px] overflow-y-auto">
                    {selectedReport.description}
                  </div>
                </div>

                {/* Arus Box Pesan */}
                <div className="md:col-span-2 flex flex-col justify-between h-[380px]">
                  <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto p-5 custom-scrollbar">
                    {reportMessages.length === 0 ? (
                      <div className="text-center text-zinc-600 uppercase text-[10px] font-black mt-10">
                        SISTEM: Menunggu jabat tangan data dari pelapor...
                      </div>
                    ) : (
                      reportMessages.map((item) => {
                        const mine = item.sender_id === user?.id
                        return (
                          <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-md border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              mine ? "bg-[#53FC18] text-black" : "bg-[#131920] text-white border-zinc-800"
                            }`}>
                              <p className="text-[8px] font-black uppercase opacity-60 mb-0.5">
                                {mine ? "⚡ CONSOLE_ADMIN_OVERRIDE" : "🔴 INVESTIGATED_TARGET_USER"}
                              </p>
                              <p className="text-xs font-bold uppercase leading-snug break-words">{item.message}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Form Balas Chat */}
                  <form onSubmit={handleReplyReport} className="border-t-2 border-black p-3 bg-[#0E1318] flex gap-2">
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

          {/* GRID SECTION FOR MANAGEMENT MANAGEMENT ACTIONS */}
          <div className="grid gap-10 lg:grid-cols-2">
            
            {/* ANNOUNCEMENT CREATOR SYSTEM */}
            <section className="space-y-6">
              <form onSubmit={handleCreateAnnouncement} className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Megaphone size={22} className="text-[#53FC18]" /> SYSTEM BROADCAST MODULATOR
                </h2>
                <div className="grid gap-4">
                  <input
                    value={announcement.title}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, title: e.target.value }))}
                    placeholder="ANNOUNCEMENT CRITICAL HEADLINE"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-[#53FC18]"
                  />
                  <textarea
                    value={announcement.message}
                    onChange={(e) => setAnnouncement((p) => ({ ...p, message: e.target.value }))}
                    placeholder="DETAILED BROADCAST LOG MESSAGE CONTENT..."
                    className="h-20 border-2 border-black bg-[#131920] p-4 text-xs font-black uppercase outline-none focus:border-[#53FC18] resize-none"
                  />
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[8px] font-black text-zinc-500 uppercase mb-1">SCHEDULER START TIME</label>
                      <input
                        type="datetime-local"
                        value={announcement.starts_at}
                        onChange={(e) => setAnnouncement((p) => ({ ...p, starts_at: e.target.value }))}
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-[#53FC18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-zinc-500 uppercase mb-1">AUTO DESTRUCTION TIME</label>
                      <input
                        type="datetime-local"
                        value={announcement.ends_at}
                        onChange={(e) => setAnnouncement((p) => ({ ...p, ends_at: e.target.value }))}
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-[#53FC18]"
                      />
                    </div>
                  </div>
                </div>
                <button className="w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]">
                  📣 PULSE LIVE ANNOUNCEMENT
                </button>
              </form>

              {/* SYSTEM ANNOUNCEMENT REGISTRY */}
              <div className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-md font-black uppercase tracking-widest text-zinc-400 mb-4">// ACTIVE SYSTEM REGISTRY</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {announcements.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600 font-black uppercase">REGISTRY_EMPTY // NO DATA</div>
                  ) : (
                    announcements.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border-2 border-black bg-[#131920] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="truncate">
                          <p className="text-xs font-black text-[#53FC18] truncate uppercase">{item.title}</p>
                          <p className="text-[10px] text-zinc-500 truncate uppercase mt-0.5">{item.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnouncement(item.id)}
                          className="border border-black bg-red-600 p-2 text-white hover:bg-red-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
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

            {/* TOURNAMENT REGISTRATION CREATOR MODULE */}
            <section className="space-y-6">
              <form onSubmit={handleCreateTournament} className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Trophy size={22} className="text-yellow-500" /> TOURNAMENT REGISTRATION CORE
                </h2>
                
                <div className="grid gap-4">
                  <div className="grid gap-4 grid-cols-2">
                    <input
                      value={tournamentForm.title}
                      onChange={(e) => setTournamentForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="TOURNAMENT EVENT NAME"
                      className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                    />
                    <select
                      value={tournamentForm.game_id}
                      onChange={(e) => setTournamentForm((p) => ({ ...p, game_id: e.target.value }))}
                      className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase text-zinc-400 outline-none focus:border-yellow-500"
                    >
                      <option value="">-- SELECT GAME MATCH --</option>
                      {games.map((g) => (
                        <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={tournamentForm.description}
                    onChange={(e) => setTournamentForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="SHORT TOURNAMENT RULES / OVERVIEW"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                  />
                  <input
                    value={tournamentForm.banner_url}
                    onChange={(e) => setTournamentForm((p) => ({ ...p, banner_url: e.target.value }))}
                    placeholder="BANNER POSTER URL STATIC IMAGE"
                    className="h-12 border-2 border-black bg-[#131920] px-4 text-xs font-black uppercase outline-none focus:border-yellow-500"
                  />

                  <div className="grid gap-4 grid-cols-3">
                    <div>
                      <label className="block text-[8px] font-black text-zinc-500 uppercase mb-1">MATCH DATE</label>
                      <input
                        type="date"
                        value={tournamentForm.date}
                        onChange={(e) => setTournamentForm((p) => ({ ...p, date: e.target.value }))}
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black text-zinc-400 outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-zinc-500 uppercase mb-1">TOTAL PRIZE POOL</label>
                      <input
                        value={tournamentForm.prize}
                        onChange={(e) => setTournamentForm((p) => ({ ...p, prize: e.target.value }))}
                        placeholder="RP 10.000.000"
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black uppercase outline-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-zinc-500 uppercase mb-1">MAX CAPACITY PLOTS</label>
                      <input
                        type="number"
                        value={tournamentForm.max_players}
                        onChange={(e) => setTournamentForm((p) => ({ ...p, max_players: parseInt(e.target.value) || 128 }))}
                        className="h-12 w-full border-2 border-black bg-[#131920] px-3 text-xs font-black outline-none focus:border-yellow-500"
                      />
                    </div>
                  </div>
                </div>

                <button className="w-full border-2 border-black bg-yellow-500 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400">
                  🏆 AUTHORIZE NEW TOURNAMENT EVENT
                </button>
              </form>

              {/* LIST TOURNAMENTS REGISTRY ACTIVE */}
              <div className="border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-md font-black uppercase tracking-widest text-zinc-400 mb-4">// LIVE BRUTAL ESPORTS TOURNAMENTS</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {tournaments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600 font-black uppercase">NO_TOURNAMENTS_FOUND // GATEWAY_OPEN</div>
                  ) : (
                    tournaments.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 border-2 border-black bg-[#131920] p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <div className="truncate">
                          <p className="text-xs font-black text-yellow-500 truncate uppercase flex items-center gap-1.5">
                            <span>{item.title}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate uppercase mt-0.5">PRIZE: {item.prize || "FREE ENTRY"} • MAX: {item.max_players} SLOTS</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTournament(item.id)}
                          className="border border-black bg-red-600 p-2 text-white hover:bg-red-700 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
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

      {/* CORE CONTROL SECURITY MODERATION MODAL */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-6 text-white font-mono shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
            <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-red-500">
              <AlertTriangle size={28} className="stroke-[2.5] animate-bounce" />
              <h3 className="text-lg font-black uppercase tracking-tight">MODERATION OVERRIDE SYSTEM</h3>
            </div>
            <div className="my-5 space-y-3 text-xs uppercase">
              <p className="font-black text-zinc-500">TARGET ACCOUNT SIGNATURE:</p>
              <div className="p-3 bg-black border border-zinc-800 text-red-400 font-black break-all text-xs">{modalConfig.targetUser?.name}</div>
              
              {(modalConfig.type === "ban" || modalConfig.type === "mute") ? (
                <div>
                  <label className="block font-black text-zinc-400 mb-1.5">REASON SPECIFICATION (REQUIRED):</label>
                  <input
                    type="text"
                    value={modalConfig.reason}
                    onChange={(e) => setModalConfig(p => ({ ...p, reason: e.target.value }))}
                    className="w-full h-12 border-2 border-black bg-[#131920] px-3 font-bold uppercase text-white outline-none focus:border-red-500"
                  />
                </div>
              ) : (
                <p className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-300 leading-relaxed font-bold">Apakah Anda menyetujui pemulihan total terhadap regulasi hak akses akun user ini?</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={closeModerationModal} className="h-12 border-2 border-black bg-zinc-800 text-xs font-black uppercase">ABORT</button>
              <button 
                onClick={handleExecuteModeration}
                disabled={(modalConfig.type === "ban" || modalConfig.type === "mute") && !modalConfig.reason.trim()}
                className={`h-12 border-2 border-black text-xs font-black uppercase disabled:opacity-30 ${
                  modalConfig.type === "ban" ? "bg-red-600 text-white" : modalConfig.type === "mute" ? "bg-yellow-500 text-black" : "bg-[#53FC18] text-black"
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

function Stat({ label, value, live, danger, icon }: { label: string; value: string | number; live?: boolean; danger?: boolean; icon: React.ReactNode }) {
  return (
    <div className={`border-4 border-black p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between ${
      danger ? "bg-red-950/30 text-red-400 border-red-900/80" : live ? "bg-[#102210] text-[#53FC18] border-green-900/80" : "bg-[#0E1318]"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-black tracking-tighter md:text-4xl">{value}</h2>
          {live && <span className="h-2 w-2 animate-ping bg-[#53FC18] rounded-full" />}
        </div>
        <div className="opacity-30 text-zinc-400">{icon}</div>
      </div>
      <p className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
    </div>
  )
}