"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { api } from "@/lib/axios"
import { socket } from "@/lib/socket"
import { useAuthStore } from "@/store/auth.store"

export default function RoomChatPage() {
  const params = useParams()
  const roomId = params.id as string
  const user = useAuthStore((state) => state.user)

  const [chatId, setChatId] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [error, setError] = useState("")

  async function loadRoomMessages() {
    try {
      const res = await api.get(`/chats/room/${roomId}/messages`)
      setChatId(res.data.chat_id)
      setMessages(res.data.messages)

      socket.connect()
      socket.emit("join_chat", res.data.chat_id)
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal membuka room chat")
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) return

    try {
      await api.post(`/chats/room/${roomId}/messages`, {
        content,
      })
      setContent("")
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal mengirim pesan")
    }
  }

  useEffect(() => {
    loadRoomMessages()

    socket.on("message_received", (message) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
    })

    return () => {
      if (chatId) socket.emit("leave_chat", chatId)
      socket.off("message_received")
    }
  }, [roomId, chatId])

  return (
    <ProtectedRoute>
      {/* INJEKSI STYLE KUSTOM UNTUK SCROLLBAR BRUTALIST KOTAK HIJAU */}
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
        /* Firefox Support */
        .brutalist-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #53fc18 #0e1318;
        }
      `}</style>

      <main className="flex h-screen bg-[#0B0E11] font-mono text-white overflow-hidden">
        <Sidebar />

        <section className="flex flex-1 flex-col bg-[#0B0E11]">
          {/* CHAT MONITOR HEADER */}
          <div className="flex h-20 flex-col justify-center border-b-4 border-black bg-[#0E1318] px-8">
            <h1 className="text-xl font-black uppercase tracking-tight text-[#53FC18]">
              CONSOLE // ROOM_CHAT
            </h1>
            <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
              ROOM_ID: {roomId}
            </p>
          </div>

          {/* ERROR LOGGER BOX */}
          {error ? (
            <div className="m-6 border-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase tracking-wider text-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ SYSTEM_ERROR: {error}
            </div>
          ) : (
            <>
              {/* CHAT MESSAGES PANEL */}
              <div className="brutalist-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
                {messages.length === 0 ? (
                  <div className="border-2 border-black bg-[#0E1318] p-8 text-xs font-black uppercase tracking-widest text-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                    [ NO DATA LOGGED: RECENT SESSION MESSAGES EMPTY ]
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const mine = msg.sender_id === user?.id
                    const senderName = msg.sender?.display_name || msg.sender?.username || "UNKNOWN_PLAYER"

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex w-full ${
                          mine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md w-full border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                            mine
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#1E252B] text-white"
                          }`}
                        >
                          {/* BALLOON HEADER STRIP */}
                          <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1.5 text-[9px] font-black uppercase tracking-wider">
                            <span className={mine ? "text-black/70" : "text-[#53FC18]"}>
                              {mine ? "YOU" : senderName.toUpperCase()}
                            </span>
                            <span className={mine ? "text-black/40" : "text-zinc-500"}>
                              {mine ? "// OUTGOING" : "// INCOMING"}
                            </span>
                          </div>

                          {/* CONTENT */}
                          <p className="text-xs font-bold uppercase tracking-tight leading-relaxed break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* CHAT ENTRY TRANSMITTER SUBMIT */}
              <form
                onSubmit={sendMessage}
                className="border-t-4 border-black bg-[#0E1318] p-6"
              >
                <div className="flex items-center gap-4 border-2 border-black bg-[#191B1F] p-2 pr-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="CHAT KHUSUS MEMBER ROOM..."
                    className="h-12 flex-1 bg-transparent px-4 text-xs font-black uppercase tracking-wider text-white outline-none placeholder-zinc-600"
                  />

                  <button className="h-10 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#6eff3b] active:translate-x-[1px] active:translate-y-[1px]">
                    SEND
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