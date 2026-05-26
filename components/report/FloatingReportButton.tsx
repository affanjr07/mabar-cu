"use client"

import { useEffect, useState } from "react"
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

    if (!title.trim()) {
      setNotice("Judul laporan wajib diisi.")
      return
    }

    try {
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
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!report?.id || !chatMessage.trim()) return

    try {
      setNotice("")

      await sendReportMessage(report.id, chatMessage)
      setChatMessage("")
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal kirim pesan.")
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
      const currentReportId = report?.id || activeRoom

      if (closedReport?.id === currentReportId) {
        setReport(null)
        setMessages([])
        setActiveRoom(null)
        setNotice("Report sudah ditutup oleh admin. Kamu bisa membuat report baru.")
      }
    }

    socket.on("report_message_received", handleReportMessage)
    socket.on("report_closed", handleReportClosed)

    return () => {
      socket.off("report_message_received", handleReportMessage)
      socket.off("report_closed", handleReportClosed)
    }
  }, [isAuthenticated, user?.id, report?.id, activeRoom])

  if (!hasHydrated) return null
  if (!isAuthenticated || !user?.id) return null
  if (hiddenPages) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#53FC18] text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      >
        <ShieldAlert size={28} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col border-2 border-black bg-[#0E1318] font-mono text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b-2 border-black bg-[#191B1F] p-4">
            <div>
              <h2 className="text-lg font-black uppercase text-[#53FC18]">
                Report Livechat
              </h2>

              <p className="text-[10px] font-black uppercase text-zinc-500">
                Satu report aktif per user.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {notice && (
            <div className="border-b-2 border-black bg-[#142A14] p-3 text-[10px] font-black uppercase text-[#53FC18]">
              {notice}
            </div>
          )}

          {!report ? (
            <form
              onSubmit={handleCreateReport}
              className="flex flex-1 flex-col p-4"
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="JUDUL KELUHAN"
                className="h-12 border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="CERITAKAN KENDALA..."
                className="mt-3 flex-1 resize-none border-2 border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
              />

              <button className="mt-4 border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black">
                Create Report
              </button>
            </form>
          ) : (
            <>
              <div className="border-b-2 border-black bg-[#0B0E11] p-3">
                <p className="text-xs font-black uppercase text-white">
                  {report.title}
                </p>

                <p className="text-[10px] font-black uppercase text-[#53FC18]">
                  Status: {report.status}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#191B1F] p-4 text-[10px] font-black uppercase text-zinc-500">
                    Belum ada balasan. Tunggu admin masuk ke livechat.
                  </div>
                ) : (
                  messages.map((item) => {
                    const mine = item.sender_id === user?.id

                    return (
                      <div
                        key={item.id}
                        className={`flex ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] border-2 border-black p-3 text-xs font-bold uppercase ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#191B1F] text-white"
                          }`}
                        >
                          <p className="mb-1 text-[9px] font-black opacity-70">
                            {mine ? "YOU" : item.sender_role || "ADMIN"}
                          </p>

                          <p className="break-words">{item.message}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="border-t-2 border-black p-3"
              >
                <div className="flex gap-2">
                  <input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="KETIK PESAN..."
                    className="h-11 flex-1 border-2 border-black bg-[#191B1F] px-3 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                  />

                  <button className="border-2 border-black bg-[#53FC18] px-4 text-xs font-black uppercase text-black">
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