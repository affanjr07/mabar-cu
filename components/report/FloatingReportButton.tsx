"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, X } from "lucide-react"
import { socket } from "@/lib/socket"
import {
  closeReport,
  createReport,
  getMyActiveReport,
  getReportMessages,
  sendReportMessage,
} from "@/services/report.service"
import { useAuthStore } from "@/store/auth.store"

export default function FloatingReportButton() {
  const user = useAuthStore((state) => state.user)

  const [open, setOpen] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [notice, setNotice] = useState("")

  async function loadActiveReport() {
    try {
      const active = await getMyActiveReport()
      setReport(active)

      if (active?.id) {
        const data = await getReportMessages(active.id)
        setMessages(data)

        if (!socket.connected) socket.connect()
        socket.emit("join_report", active.id)
      }
    } catch {
      setReport(null)
      setMessages([])
    }
  }

  async function handleCreateReport(e: React.FormEvent) {
    e.preventDefault()

    try {
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
      await sendReportMessage(report.id, chatMessage)
      setChatMessage("")
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal kirim pesan.")
    }
  }

  async function handleCloseReport() {
    if (!report?.id) return

    try {
      await closeReport(report.id)
      setReport(null)
      setMessages([])
      setNotice("Report ditutup. Kamu bisa membuat report baru.")
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal menutup report.")
    }
  }

  useEffect(() => {
    if (open) loadActiveReport()
  }, [open])

  useEffect(() => {
    if (!user?.id) return

    socket.connect()

    socket.on("report_message_received", (message) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        return [...prev, message]
      })
    })

    socket.on("report_closed", () => {
      setReport(null)
      setMessages([])
      setNotice("Report sudah ditutup.")
    })

    return () => {
      socket.off("report_message_received")
      socket.off("report_closed")
    }
  }, [user?.id])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-[#53FC18] text-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]"
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
                Support ticket system
              </p>
            </div>

            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {notice && (
            <div className="border-b-2 border-black bg-[#142A14] p-3 text-[10px] font-black uppercase text-[#53FC18]">
              {notice}
            </div>
          )}

          {!report ? (
            <form onSubmit={handleCreateReport} className="flex flex-1 flex-col p-4">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="JUDUL KELUHAN"
                className="h-12 border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="CERITAKAN KENDALA..."
                className="mt-3 flex-1 resize-none border-2 border-black bg-[#191B1F] p-4 text-xs font-black uppercase outline-none"
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
                {messages.map((item) => {
                  const mine = item.sender_id === user?.id

                  return (
                    <div
                      key={item.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] border-2 border-black p-3 text-xs font-bold uppercase ${
                          mine
                            ? "bg-[#53FC18] text-black"
                            : "bg-[#191B1F] text-white"
                        }`}
                      >
                        <p className="mb-1 text-[9px] font-black opacity-70">
                          {item.sender_role}
                        </p>
                        {item.message}
                      </div>
                    </div>
                  )
                })}
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
                    className="h-11 flex-1 border-2 border-black bg-[#191B1F] px-3 text-xs font-black uppercase outline-none"
                  />

                  <button className="border-2 border-black bg-[#53FC18] px-4 text-xs font-black uppercase text-black">
                    Send
                  </button>
                </div>

              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}