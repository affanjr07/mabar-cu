"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { socket } from "@/lib/socket"
import {
  createPrivateChat,
  getChatMessages,
  sendChatMessage,
} from "@/services/chat.service"
import {
  getCommunityChannels,
  getCommunityMessages,
  sendCommunityMessage,
} from "@/services/community.service"
import { searchPlayers } from "@/services/dashboard.service"
import { useAuthStore } from "@/store/auth.store"

interface Message {
  id?: string
  chat_id?: string
  channel_id?: string
  sender_id?: string
  content?: string
  image_url?: string
  sticker_url?: string
  message_type?: string
  is_flagged?: boolean
  moderation_status?: string
  created_at?: string
}

interface Player {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  online_status?: boolean
  favorite_game?: string
  game_rank?: string
  preferred_role?: string
}

interface CommunityChannel {
  id: string
  game_id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  games?: {
    id: string
    name: string
    genre: string
  }
}

type ChatMode = "private" | "community"

export default function ChatPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [mode, setMode] = useState<ChatMode>("community")

  const [targetUserId, setTargetUserId] = useState("")
  const [playerSearch, setPlayerSearch] = useState("")
  const [players, setPlayers] = useState<Player[]>([])

  const [channels, setChannels] = useState<CommunityChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<CommunityChannel | null>(null)

  const [joinedChatId, setJoinedChatId] = useState("")
  const [activePlayerName, setActivePlayerName] = useState("")

  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState("")
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingChannels, setLoadingChannels] = useState(false)

  async function loadPlayers(keyword = "") {
    try {
      setLoadingPlayers(true)
      const data = await searchPlayers(keyword)
      setPlayers(data)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MENGAMBIL DATA PLAYER.")
    } finally {
      setLoadingPlayers(false)
    }
  }

  async function loadCommunityChannels() {
    try {
      setLoadingChannels(true)
      const data = await getCommunityChannels()
      setChannels(data)

      if (data.length > 0 && !activeChannel) {
        await openCommunityChannel(data[0])
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MENGAMBIL COMMUNITY CHANNEL.")
    } finally {
      setLoadingChannels(false)
    }
  }

  async function openCommunityChannel(channel: CommunityChannel) {
    try {
      setMode("community")
      setError("")
      setActiveChannel(channel)
      setJoinedChatId("")
      setActivePlayerName("")

      const data = await getCommunityMessages(channel.id)
      setMessages(data)

      if (!socket.connected) socket.connect()

      socket.emit("join_community_channel", channel.id)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MASUK COMMUNITY CHANNEL.")
    }
  }

  async function startPrivateChat(id?: string, name?: string) {
    const selectedTargetId = id || targetUserId

    if (!selectedTargetId.trim()) {
      setError("MASUKKAN PLAYER ID ATAU PILIH PLAYER TERLEBIH DAHULU.")
      return
    }

    try {
      setMode("private")
      setError("")
      setLoadingChat(true)
      setActiveChannel(null)

      const privateChat = await createPrivateChat(selectedTargetId)
      const chatId = privateChat.chat.id

      setJoinedChatId(chatId)
      setActivePlayerName(name || selectedTargetId)

      const data = await getChatMessages(chatId)
      setMessages(data)

      if (!socket.connected) socket.connect()

      socket.emit("join_chat", chatId)
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "GAGAL MEMULAI CHAT. PASTIKAN KAMU SUDAH FOLLOW PLAYER INI."
      )
    } finally {
      setLoadingChat(false)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setError("")

      if (mode === "community") {
        if (!activeChannel) {
          setError("PILIH COMMUNITY CHANNEL TERLEBIH DAHULU.")
          return
        }

        await sendCommunityMessage(activeChannel.id, content)
      }

      if (mode === "private") {
        if (!joinedChatId) return

        await sendChatMessage(joinedChatId, {
          content,
          message_type: "text",
        })
      }

      setContent("")
      setTyping(false)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MENGIRIM PESAN.")
    }
  }

  function handleTyping(value: string) {
    setContent(value)

    if (mode !== "private") return
    if (!joinedChatId || !user) return

    socket.emit("typing_start", {
      chatId: joinedChatId,
      userId: user.id,
    })

    setTimeout(() => {
      socket.emit("typing_stop", {
        chatId: joinedChatId,
        userId: user.id,
      })
    }, 800)
  }

  function handleVisitProfile(playerId: string) {
    router.push(`/users/${playerId}`)
  }

  useEffect(() => {
    loadPlayers()
    loadCommunityChannels()

    socket.connect()

    if (user?.id) {
      socket.emit("user_online", user.id)
    }

    socket.on("message_received", (message) => {
      if (mode !== "private") return

      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev

        if (message.chat_id && joinedChatId && message.chat_id !== joinedChatId) {
          return prev
        }

        return [...prev, message]
      })
    })

    socket.on("community_message_received", (message) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id)
        if (exists) return prev

        if (
          activeChannel?.id &&
          message.channel_id &&
          message.channel_id !== activeChannel.id
        ) {
          return prev
        }

        return [...prev, message]
      })
    })

    socket.on("user_typing", (data) => {
      if (data.userId !== user?.id) {
        setTyping(data.typing)
      }
    })

    return () => {
      if (activeChannel?.id) {
        socket.emit("leave_community_channel", activeChannel.id)
      }

      socket.off("message_received")
      socket.off("community_message_received")
      socket.off("user_typing")
      socket.disconnect()
    }
  }, [user?.id, joinedChatId, activeChannel?.id, mode])

  const title =
    mode === "community"
      ? activeChannel
        ? `COMMUNITY // ${activeChannel.name.toUpperCase()}`
        : "COMMUNITY CHAT"
      : activePlayerName
        ? `PRIVATE // CHAT_WITH_${activePlayerName.toUpperCase()}`
        : "PRIVATE CHAT"

  const subtitle =
    mode === "community"
      ? activeChannel
        ? `CHANNEL_ID: ${activeChannel.id}`
        : "PILIH CHANNEL GAME UNTUK CHAT PUBLIK"
      : joinedChatId
        ? `ROOM_ID: ${joinedChatId}`
        : "PILIH PLAYER TARGET UNTUK PRIVATE CHAT"

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

        <section className="flex flex-1 overflow-hidden">
          <aside className="brutalist-scrollbar hidden w-96 overflow-y-auto border-r-4 border-black bg-[#0E1318] p-6 lg:flex lg:flex-col">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              // CHAT_CONTROLLER
            </div>

            <h1 className="text-3xl font-black uppercase tracking-tight text-[#53FC18]">
              Messages
            </h1>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMode("community")
                  setJoinedChatId("")
                  setActivePlayerName("")
                  if (activeChannel) openCommunityChannel(activeChannel)
                }}
                className={`h-11 border-2 border-black text-xs font-black uppercase ${
                  mode === "community"
                    ? "bg-[#53FC18] text-black"
                    : "bg-[#191B1F] text-[#53FC18]"
                }`}
              >
                Community
              </button>

              <button
                onClick={() => {
                  setMode("private")
                  setMessages([])
                  setActiveChannel(null)
                }}
                className={`h-11 border-2 border-black text-xs font-black uppercase ${
                  mode === "private"
                    ? "bg-[#53FC18] text-black"
                    : "bg-[#191B1F] text-[#53FC18]"
                }`}
              >
                Private
              </button>
            </div>

            {mode === "community" ? (
              <>
                <p className="mt-5 border-b border-black pb-4 text-xs font-bold uppercase leading-relaxed text-zinc-400">
                  Pilih channel game. Semua user login bisa chat publik, tapi pesan tetap dimoderasi.
                </p>

                <div className="brutalist-scrollbar mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
                  {loadingChannels ? (
                    <div className="border border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-zinc-500">
                      ⌛ LOADING CHANNELS...
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="border border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-zinc-500">
                      ❌ BELUM ADA CHANNEL.
                    </div>
                  ) : (
                    channels.map((channel) => {
                      const active = activeChannel?.id === channel.id

                      return (
                        <button
                          key={channel.id}
                          onClick={() => openCommunityChannel(channel)}
                          className={`w-full border-2 border-black p-4 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                            active
                              ? "bg-[#53FC18] text-black"
                              : "bg-[#191B1F] text-white hover:bg-black"
                          }`}
                        >
                          <h2 className="text-xs font-black uppercase tracking-tight">
                            {channel.name}
                          </h2>

                          <p
                            className={`mt-1 text-[10px] font-black uppercase ${
                              active ? "text-black/60" : "text-[#53FC18]"
                            }`}
                          >
                            {channel.games?.genre || "GAME CHANNEL"} • PUBLIC
                          </p>
                        </button>
                      )
                    })
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mt-5 border-b border-black pb-4 text-xs font-bold uppercase leading-relaxed text-zinc-400">
                  Private chat hanya bisa dimulai jika kamu follow / friend player target.
                </p>

                <div className="mt-6 space-y-3">
                  <input
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="MASUKKAN PLAYER ID"
                    className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase tracking-wider text-white outline-none focus:border-[#53FC18]"
                  />

                  <button
                    onClick={() => startPrivateChat()}
                    disabled={loadingChat}
                    className="h-12 w-full border-2 border-black bg-white text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-zinc-200 disabled:opacity-40"
                  >
                    {loadingChat ? "CONNECTING..." : "START CHAT BY ID"}
                  </button>
                </div>

                <div className="mt-6">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    SEARCH PLAYER:
                  </div>

                  <input
                    value={playerSearch}
                    onChange={async (e) => {
                      const value = e.target.value
                      setPlayerSearch(value)
                      await loadPlayers(value)
                    }}
                    placeholder="CARI PLAYER..."
                    className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase tracking-wider text-white outline-none focus:border-[#53FC18]"
                  />
                </div>

                <div className="brutalist-scrollbar mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
                  {loadingPlayers ? (
                    <div className="border border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-zinc-500">
                      ⌛ QUERYING PLAYER...
                    </div>
                  ) : players.length === 0 ? (
                    <div className="border border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-zinc-500">
                      ❌ TIDAK ADA PLAYER.
                    </div>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="border-2 border-black bg-[#191B1F] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex items-center gap-4">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.username}
                              className="h-12 w-12 border border-black object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black bg-zinc-800 text-sm font-black uppercase text-white">
                              {player.username.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h2 className="truncate text-xs font-black uppercase tracking-tight text-white">
                              {player.display_name || player.username}
                            </h2>

                            <p className="mt-0.5 truncate text-[10px] font-black uppercase tracking-wide text-[#53FC18]">
                              {player.preferred_role || "NO ROLE"} •{" "}
                              {player.game_rank || "UNRANKED"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              startPrivateChat(
                                player.id,
                                player.display_name || player.username
                              )
                            }
                            className="h-9 border border-black bg-[#53FC18] text-xs font-black uppercase tracking-wider text-black"
                          >
                            Chat
                          </button>

                          <button
                            onClick={() => handleVisitProfile(player.id)}
                            className="h-9 border border-black bg-zinc-900 text-xs font-black uppercase tracking-wider text-zinc-300"
                          >
                            Profile
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </aside>

          <section className="flex flex-1 flex-col bg-[#0B0E11]">
            <div className="flex h-20 items-center justify-between border-b-4 border-black bg-[#0E1318] px-8">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">
                  {title}
                </h1>

                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                  {subtitle}
                </p>
              </div>
            </div>

            {error && (
              <div className="m-6 border-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase tracking-wider text-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                ⚠️ SYSTEM_ERROR: {error}
              </div>
            )}

            <div className="brutalist-scrollbar flex-1 space-y-6 overflow-y-auto p-8">
              {messages.length === 0 ? (
                <div className="border-2 border-black bg-[#0E1318] p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  [ NO DATA LOGGED: SESSION MESSAGES EMPTY ]
                </div>
              ) : (
                messages.map((message, index) => {
                  const mine = message.sender_id === user?.id

                  return (
                    <div
                      key={message.id || index}
                      className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md w-full border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          mine
                            ? "bg-[#53FC18] text-black"
                            : "bg-[#1E252B] text-white"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1.5 text-[9px] font-black uppercase tracking-wider">
                          <span className={mine ? "text-black/70" : "text-[#53FC18]"}>
                            {mine ? "YOU" : "PLAYER"}
                          </span>

                          <span className={mine ? "text-black/40" : "text-zinc-500"}>
                            {mode === "community" ? "// COMMUNITY" : "// PRIVATE"}
                          </span>
                        </div>

                        <p className="break-words text-xs font-bold uppercase leading-relaxed tracking-tight">
                          {message.content}
                        </p>

                        {message.is_flagged && (
                          <p className="mt-2 inline-block border border-black bg-black px-2 py-0.5 text-[9px] font-black uppercase text-red-500">
                            💥 FLAGGED BY MODERATION
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}

              {typing && (
                <div className="inline-flex animate-pulse border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                  ⚡ TARGET IS TYPING DATA...
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t-4 border-black bg-[#0E1318] p-6"
            >
              <div className="flex items-center gap-4 border-2 border-black bg-[#191B1F] p-2 pr-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <input
                  value={content}
                  onChange={(e) => handleTyping(e.target.value)}
                  disabled={mode === "community" ? !activeChannel : !joinedChatId}
                  placeholder={
                    mode === "community"
                      ? activeChannel
                        ? "KIRIM PESAN COMMUNITY..."
                        : "PILIH CHANNEL COMMUNITY..."
                      : joinedChatId
                        ? "KIRIM PESAN PRIVATE..."
                        : "PILIH PLAYER..."
                  }
                  className="h-12 flex-1 bg-transparent px-4 text-xs font-black uppercase tracking-wider text-white outline-none placeholder-zinc-600 disabled:opacity-40"
                />

                <button
                  disabled={mode === "community" ? !activeChannel : !joinedChatId}
                  className="h-10 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#6eff3b] disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </form>
          </section>
        </section>
      </main>
    </ProtectedRoute>
  )
}