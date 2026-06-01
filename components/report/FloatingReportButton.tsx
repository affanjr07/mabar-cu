"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { ShieldAlert, X } from "lucide-react"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import {
  createReport,
  getMyActiveReport,
  getReportMessages,
  sendReportMessage,
} from "@/services/report.service"

export default function FloatingReportButton() {
  const pathname = usePathname()

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  const [open, setOpen] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [notice, setNotice] = useState("")
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const messageEndRef = useRef<HTMLDivElement>(null)

  const hiddenPages =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/admin")

  function resetState() {
    if (activeRoom) {
      socket.emit("leave_report", activeRoom)
    }

    setOpen(false)
    setReport(null)
    setMessages([])
    setTitle("")
    setDescription("")
    setChatMessage("")
    setNotice("")
    setActiveRoom(null)
  }

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, open])

  async function loadActiveReport() {
    if (!user?.id || !isAuthenticated) return

    try {
      const active = await getMyActiveReport()
      setReport(active)

      if (active?.id) {
        const data = await getReportMessages(active.id)
        setMessages(data || [])

        if (!socket.connected) socket.connect()

        if (activeRoom && activeRoom !== active.id) {
          socket.emit("leave_report", activeRoom)
        }

        socket.emit("join_report", active.id)
        setActiveRoom(active.id)
      } else {
        setMessages([])
        setActiveRoom(null)
      }
    } catch {
      setReport(null)
      setMessages([])
      setActiveRoom(null)
    }
  }

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || isSubmitting) {
      setNotice("Judul laporan wajib diisi.")
      return
    }

    try {
      setIsSubmitting(true)
      setNotice("")

      const result = await createReport({
        title,
        description,
      })

      setReport(result.report)
      setTitle("")
      setDescription("")
      setNotice("Report dibuat. Tunggu admin membalas.")

      await loadActiveReport()
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal membuat report.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!report?.id || !chatMessage.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      setNotice("")

      const textToSend = chatMessage
      setChatMessage("")

      await sendReportMessage(report.id, textToSend)
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal kirim pesan.")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    resetState()
  }, [user?.id])

  useEffect(() => {
    if (!open) return
    if (!isAuthenticated || !user?.id) return

    loadActiveReport()
  }, [open, isAuthenticated, user?.id])

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      resetState()
      return
    }

    if (!socket.connected) socket.connect()

    function handleReportMessage(message: any) {
      if (!message?.report_id) return

      setMessages((prev) => {
        const currentReportId = report?.id || activeRoom
        if (message.report_id !== currentReportId) return prev

        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev

        return [...prev, message]
      })
    }

    function handleReportClosed(closedReport: any) {
      setReport((currentReport: any) => {
        const currentId = currentReport?.id || activeRoom
        if (closedReport?.id === currentId) {
          setMessages([])
          setActiveRoom(null)
          setNotice("Report sudah ditutup oleh admin. Kamu bisa membuat report baru.")
          return null
        }
        return currentReport
      })
    }

    socket.on("report_message_received", handleReportMessage)
    socket.on("report_closed", handleReportClosed)

    return () => {
      socket.off("report_message_received", handleReportMessage)
      socket.off("report_closed", handleReportClosed)
    }
  }, [isAuthenticated, user?.id, activeRoom])

  if (!hasHydrated || !isAuthenticated || !user?.id || hiddenPages) return null

  return (
    <>
      {/* FLOATING ACTION BUTTON - Posisi dinaikkan dari bawah agar tidak mentok sidebar/navigasi */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open report livechat"
        className="fixed bottom-24 right-6 lg:bottom-28 lg:right-8 z-[60] flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full border-4 border-black bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
      >
        {open ? <X size={24} className="lg:hidden" /> : <ShieldAlert size={26} />}
      </button>

      {/* CHAT PANEL WINDOW CONTAINER - Posisi disesuaikan berada tepat di atas tombol baru */}
      {open && (
        <div className="fixed bottom-40 right-4 left-4 sm:left-auto sm:right-6 lg:bottom-48 lg:right-8 z-50 flex h-[calc(100vh-220px)] max-h-[480px] w-auto sm:w-[360px] flex-col border-2 border-black bg-[#0E1318] font-mono text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          
          {/* HEADER CHAT */}
          <div className="flex items-center justify-between border-b-2 border-black bg-[#191B1F] p-4">
            <div>
              <h2 className="text-sm lg:text-base font-black uppercase text-[#53FC18]">
                Report Livechat
              </h2>
              <p className="text-[9px] lg:text-[10px] font-black uppercase text-zinc-500">
                Satu report aktif per user.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* NOTICE ALERT ELEMENT */}
          {notice && (
            <div className="border-b-2 border-black bg-[#142A14] p-3 text-[10px] font-black uppercase text-[#53FC18] break-words">
              {notice}
            </div>
          )}

          {/* BLOCK 1: FORM PEMBUATAN REPORT BARU */}
          {!report ? (
            <form
              onSubmit={handleCreateReport}
              className="flex flex-1 flex-col p-4 overflow-y-auto"
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="JUDUL KELUHAN"
                disabled={isSubmitting}
                className="h-11 border-2 border-black bg-[#191B1F] px-3 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18] disabled:opacity-50"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="CERITAKAN KENDALA..."
                disabled={isSubmitting}
                className="mt-3 flex-1 min-h-[100px] resize-none border-2 border-black bg-[#191B1F] p-3 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18] disabled:opacity-50"
              />

              <button 
                disabled={isSubmitting || !title.trim()}
                className="mt-4 border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black transition-colors hover:bg-[#6eff3b] disabled:opacity-40"
              >
                {isSubmitting ? "CREATING..." : "Create Report"}
              </button>
            </form>
          ) : (
            // BLOCK 2: INTERFACES ROOM CHAT AKTIF
            <>
              <div className="border-b-2 border-black bg-[#0B0E11] p-3">
                <p className="text-xs font-black uppercase text-white truncate">
                  {report.title}
                </p>
                <p className="text-[10px] font-black uppercase text-[#53FC18]">
                  Status: {report.status}
                </p>
              </div>

              {/* MESSAGES HUB */}
              <div className="flex-1 space-y-3 overflow-y-auto p-4 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#191B1F] p-4 text-[10px] font-black uppercase text-zinc-500 text-center">
                    Belum ada balasan. Tunggu admin masuk ke livechat.
                  </div>
                ) : (
                  messages.map((item) => {
                    const mine = item.sender_id === user?.id

                    return (
                      <div
                        key={item.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] border-2 border-black p-2.5 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#191B1F] text-white"
                          }`}
                        >
                          <p className="mb-0.5 text-[8px] font-black opacity-60">
                            {mine ? "YOU" : item.sender_role || "ADMIN"}
                          </p>
                          <p className="break-words leading-snug">{item.message}</p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* INPUT BAR CHAT */}
              <form
                onSubmit={handleSendMessage}
                className="border-t-2 border-black p-3 bg-[#191B1F]"
              >
                <div className="flex gap-2">
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="KETIK PESAN..."
                    disabled={isSubmitting}
                    className="h-10 flex-1 border-2 border-black bg-[#0E1318] px-3 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18] disabled:opacity-50"
                  />

                  <button 
                    disabled={isSubmitting || !chatMessage.trim()}
                    className="border-2 border-black bg-[#53FC18] px-4 text-xs font-black uppercase text-black hover:bg-[#6eff3b] disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>

                <p className="mt-2 text-[9px] font-black uppercase text-zinc-500">
                  Report hanya bisa ditutup oleh admin.
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}