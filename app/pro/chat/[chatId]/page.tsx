"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"
import {
  getProChatMessages,
  sendProChatMessage,
} from "@/services/proChat.service"

export default function ProVipChatPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const chatId = params.chatId as string
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [chat, setChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  async function loadChat() {
    if (!chatId) return

    try {
      setLoading(true)
      setNotice("")

      const data = await getProChatMessages(chatId)

      setChat(data.chat)
      setMessages(data.messages || [])

      if (!socket.connected) socket.connect()
      socket.emit("join_pro_chat", chatId)
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal membuka VIP chat")
    } finally {
      setLoading(false)
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()

    if (!text.trim() || !chatId) return

    try {
      setSending(true)

      await sendProChatMessage(chatId, text)
      setText("")
    } catch (error: any) {
      setNotice(error.response?.data?.message || "Gagal mengirim pesan")
    } finally {
      setSending(false)
    }
  }

  function formatDate(date?: string) {
    if (!date) return "-"
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  function getSessionText() {
    const booking = chat?.pro_player_bookings

    if (!booking) return "VIP SESSION"

    return `${formatDate(booking.scheduled_at)} - ${formatDate(
      booking.session_end_at
    )}`
  }

  useEffect(() => {
    loadChat()

    return () => {
      if (chatId) {
        socket.emit("leave_pro_chat", chatId)
      }
    }
  }, [chatId])

  useEffect(() => {
    socket.on("pro_chat_message_received", (message) => {
      if (message.chat_id !== chatId) return

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
    })

    return () => {
      socket.off("pro_chat_message_received")
    }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const booking = chat?.pro_player_bookings
  const isClosed = Boolean(booking?.chat_closed_at)
  const isAccepted = booking?.status === "accepted"

  return (
    <ProtectedRoute>
      <main className="flex h-screen overflow-hidden bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b-2 border-black bg-[#0E1318] p-5">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="mb-2 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                  // VIP PRO CHAT
                </div>

                <h1 className="text-2xl font-black uppercase tracking-tight">
                  Pro Player Session Chat
                </h1>

                <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                  {getSessionText()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="border border-black bg-[#191B1F] px-3 py-2 text-[10px] font-black uppercase text-[#53FC18]">
                  Status: {booking?.status || "-"}
                </span>

                <span className="border border-black bg-[#191B1F] px-3 py-2 text-[10px] font-black uppercase text-[#53FC18]">
                  Payment: {booking?.payment_status || "-"}
                </span>

                <button
                  onClick={() => router.push("/pro")}
                  className="border-2 border-black bg-[#53FC18] px-4 py-2 text-[10px] font-black uppercase text-black"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {notice && (
            <div className="border-b-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase text-red-400">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-[#53FC18]">
                Loading VIP chat...
              </div>
            </div>
          ) : !isAccepted ? (
            <div className="flex flex-1 items-center justify-center p-8">
              <div className="max-w-md border-2 border-black bg-[#0E1318] p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black uppercase text-red-400">
                  Chat Belum Terbuka
                </h2>

                <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-zinc-500">
                  Chat VIP hanya bisa dipakai setelah booking dibayar dan diterima oleh pro player.
                </p>

                <button
                  onClick={() => router.push("/pro")}
                  className="mt-6 border-2 border-black bg-[#53FC18] px-6 py-3 text-xs font-black uppercase text-black"
                >
                  Kembali ke Booking
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-zinc-500">
                    Belum ada pesan. Mulai obrolan VIP session kamu.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender_id === user?.id

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xl border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#191B1F] text-white"
                          }`}
                        >
                          <p className="mb-2 text-[10px] font-black uppercase opacity-70">
                            {mine ? "YOU" : "VIP PLAYER"}
                          </p>

                          <p className="text-xs font-bold uppercase leading-relaxed">
                            {message.message}
                          </p>

                          <p className="mt-2 text-[9px] font-black uppercase opacity-50">
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}

                <div ref={bottomRef} />
              </div>

              {isClosed ? (
                <div className="border-t-2 border-black bg-red-950/40 p-4 text-center text-xs font-black uppercase text-red-400">
                  Chat VIP sudah ditutup.
                </div>
              ) : (
                <form
                  onSubmit={handleSend}
                  className="border-t-2 border-black bg-[#0E1318] p-4"
                >
                  <div className="flex gap-3">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="KETIK PESAN VIP..."
                      className="h-14 flex-1 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />

                    <button
                      disabled={sending}
                      className="border-2 border-black bg-[#53FC18] px-8 text-xs font-black uppercase text-black disabled:bg-zinc-600 disabled:text-zinc-400"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}