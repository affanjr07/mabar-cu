"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { api } from "@/lib/axios"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"

interface ChatSender {
  id?: string
  username?: string
  display_name?: string
  avatar_url?: string | null
}

interface ChatMessage {
  id: string
  chat_id?: string
  sender_id: string
  content: string
  created_at?: string
  sender?: ChatSender
}

export default function RoomChatPage() {
  const params = useParams()
  const roomId = params.id as string
  const user = useAuthStore((state) => state.user)

  const bottomRef = useRef<HTMLDivElement | null>(null)

  const [chatId, setChatId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  async function loadRoomMessages() {
    try {
      setLoading(true)
      setError("")

      const res = await api.get(`/chats/room/${roomId}/messages`)

      setChatId(res.data.chat_id)
      setMessages(res.data.messages || [])

      socket.connect()
      socket.emit("join_chat", res.data.chat_id)
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal membuka room chat")
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim() || sending) return

    try {
      setSending(true)

      await api.post(`/chats/room/${roomId}/messages`, {
        content: content.trim(),
      })

      setContent("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal mengirim pesan")
    } finally {
      setSending(false)
    }
  }

  function formatTime(date?: string) {
    if (!date) return "--:--"

    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function getSenderName(msg: ChatMessage) {
    return (
      msg.sender?.username ||
      msg.sender?.display_name ||
      "UNKNOWN_PLAYER"
    )
  }

  function getSenderAvatar(msg: ChatMessage) {
    return msg.sender?.avatar_url || null
  }

  useEffect(() => {
    loadRoomMessages()

    return () => {
      if (chatId) socket.emit("leave_chat", chatId)
    }
  }, [roomId])

  useEffect(() => {
    function handleMessageReceived(message: ChatMessage) {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev

        return [...prev, message]
      })
    }

    socket.on("message_received", handleMessageReceived)

    return () => {
      socket.off("message_received", handleMessageReceived)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ProtectedRoute>
      <style jsx global>{`
        .brutalist-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .brutalist-scrollbar::-webkit-scrollbar-track {
          background: #0e1318;
          border-left: 2px solid #000000;
        }

        .brutalist-scrollbar::-webkit-scrollbar-thumb {
          background: #53fc18;
          border: 2px solid #000000;
        }

        .brutalist-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6eff3b;
        }

        .brutalist-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #53fc18 #0e1318;
        }
      `}</style>

      <main className="flex h-screen overflow-hidden bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex flex-1 flex-col bg-[#0B0E11]">
          <div className="flex h-20 flex-col justify-center border-b-4 border-black bg-[#0E1318] px-8">
            <h1 className="text-xl font-black uppercase tracking-tight text-[#53FC18]">
              CONSOLE // ROOM_CHAT
            </h1>

            <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
              ROOM_ID: {roomId}
            </p>
          </div>

          {error ? (
            <div className="m-6 border-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase tracking-wider text-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ SYSTEM_ERROR: {error}
            </div>
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase tracking-widest text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                LOADING ROOM CHAT...
              </div>
            </div>
          ) : (
            <>
              <div className="brutalist-scrollbar flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
                {messages.length === 0 ? (
                  <div className="border-2 border-black bg-[#0E1318] p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    [ NO DATA LOGGED: RECENT SESSION MESSAGES EMPTY ]
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const mine = msg.sender_id === user?.id
                    const senderName = getSenderName(msg)
                    const avatarUrl = getSenderAvatar(msg)
                    const initial = senderName.charAt(0).toUpperCase()

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex w-full gap-3 ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!mine && (
                          <div className="h-11 w-11 shrink-0 overflow-hidden border-2 border-black bg-[#191B1F] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={senderName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-[#53FC18]">
                                {initial}
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:max-w-md ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#1E252B] text-white"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-4 border-b border-black/10 pb-1.5 text-[9px] font-black uppercase tracking-wider">
                            <span
                              className={
                                mine ? "text-black/70" : "text-[#53FC18]"
                              }
                            >
                              {mine ? "YOU" : `@${senderName}`}
                            </span>

                            <span
                              className={mine ? "text-black/50" : "text-zinc-500"}
                            >
                              {formatTime(msg.created_at)}
                            </span>
                          </div>

                          <p className="break-words text-xs font-bold uppercase leading-relaxed tracking-tight">
                            {msg.content}
                          </p>
                        </div>

                        {mine && (
                          <div className="h-11 w-11 shrink-0 overflow-hidden border-2 border-black bg-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {user?.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username || "You"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-black">
                                {(user?.username || "Y").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}

                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={sendMessage}
                className="border-t-4 border-black bg-[#0E1318] p-6"
              >
                <div className="flex items-center gap-4 border-2 border-black bg-[#191B1F] p-2 pr-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="CHAT KHUSUS MEMBER ROOM..."
                    className="h-12 flex-1 bg-transparent px-4 text-xs font-black uppercase tracking-wider text-white outline-none placeholder:text-zinc-600"
                  />

                  <button
                    disabled={sending || !content.trim()}
                    className="h-10 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    {sending ? "SENDING..." : "SEND"}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      </main>
    </ProtectedRoute>
  )
}