"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion" // Ditambahkan untuk animasi
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
import { getFollowedPlayers } from "@/services/dashboard.service"
import { useAuthStore } from "@/store/auth.store"

interface Message {
  id?: string
  chat_id?: string
  channel_id?: string
  sender_id?: string
  content?: string
  message?: string
  is_flagged?: boolean
  created_at?: string
  profiles?: {
    id?: string
    username?: string
    display_name?: string
    avatar_url?: string
    equipped_avatar_border?: any
  }
}

interface Player {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  online_status?: boolean
  last_online_text?: string
  game_rank?: string
  preferred_role?: string
  equipped_avatar_border?: any
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
  const [playersOffset, setPlayersOffset] = useState(0)
  const [hasMorePlayers, setHasMorePlayers] = useState(true)

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

  const playerLimit = 15

  const currentChatIdRef = useRef("")
  const currentChannelIdRef = useRef("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null) // Referensi scroll otomatis

  useEffect(() => {
    currentChatIdRef.current = joinedChatId
  }, [joinedChatId])

  useEffect(() => {
    currentChannelIdRef.current = activeChannel?.id || ""
  }, [activeChannel])

  // Efek scroll otomatis ke bawah setiap ada pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  const playIncomingMessageSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return

      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = "sine"
      osc.frequency.setValueAtTime(830.61, ctx.currentTime) 
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch (e) {
      console.error("Gagal memutar instrumen notifikasi pesan", e)
    }
  }

  async function loadFollowedPlayers(reset = false) {
    try {
      setLoadingPlayers(true)
      const nextOffset = reset ? 0 : playersOffset
      const data = await getFollowedPlayers(playerLimit, nextOffset)

      if (reset) {
        setPlayers(data || [])
        setPlayersOffset(playerLimit)
      } else {
        setPlayers((prev) => [...prev, ...(data || [])])
        setPlayersOffset((prev) => prev + playerLimit)
      }
      setHasMorePlayers((data || []).length === playerLimit)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MENGAMBIL FOLLOWED PLAYER.")
    } finally {
      setLoadingPlayers(false)
    }
  }

  async function loadCommunityChannels() {
    try {
      setLoadingChannels(true)
      const data = await getCommunityChannels()
      setChannels(data || [])

      if (data?.length > 0 && !activeChannel && mode === "community") {
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
      setTargetUserId("")
      setContent("")

      const data = await getCommunityMessages(channel.id)
      setMessages(data || [])

      if (!socket.connected) socket.connect()
      socket.emit("join_community_channel", channel.id)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MASUK COMMUNITY CHANNEL.")
    }
  }

  async function startPrivateChat(id?: string, name?: string) {
    const selectedTargetId = id || targetUserId
    if (!selectedTargetId.trim()) {
      setError("PILIH PLAYER TERLEBIH DAHULU.")
      return
    }

    try {
      setMode("private")
      setError("")
      setLoadingChat(true)
      setActiveChannel(null)
      setContent("")

      const privateChat = await createPrivateChat(selectedTargetId)
      const chatId = privateChat.chat.id

      setJoinedChatId(chatId)
      setActivePlayerName(name || selectedTargetId)

      const data = await getChatMessages(chatId)
      setMessages(data || [])

      if (!socket.connected) socket.connect()
      socket.emit("join_chat", chatId)
    } catch (error: any) {
      setError(error.response?.data?.message || "GAGAL MEMULAI CHAT. PASTIKAN KAMU SUDAH FOLLOW PLAYER INI.")
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
      if (error.response?.data?.code === "USER_MUTED") {
        const data = error.response.data
        const until = data.muted_until ? new Date(data.muted_until).toLocaleString("id-ID") : "Permanen"
        setError(`KAMU SEDANG DIMUTE. ALASAN: ${data.reason}. SAMPAI: ${until}`)
        return
      }
      setError(error.response?.data?.message || "GAGAL MENGIRIM PESAN.")
    }
  }

  function handleTyping(value: string) {
    setContent(value)
    if (mode !== "private" || !joinedChatId || !user) return

    socket.emit("typing_start", { chatId: joinedChatId, userId: user.id })
    setTimeout(() => {
      socket.emit("typing_stop", { chatId: joinedChatId, userId: user.id })
    }, 800)
  }

  function handleVisitProfile(playerId: string) {
    router.push(`/users/${playerId}`)
  }

  const filteredPlayers = players.filter((player) => {
    const keyword = playerSearch.toLowerCase()
    const name = `${player.username || ""} ${player.display_name || ""}`.toLowerCase()
    return name.includes(keyword)
  })

  useEffect(() => {
    loadFollowedPlayers(true)
    loadCommunityChannels()

    if (!socket.connected) socket.connect()

    if (user?.id) {
      socket.emit("user_online", user.id)
    }

    function onPrivateMessage(message: Message) {
      if (message.sender_id && user?.id && message.sender_id !== user.id) {
        playIncomingMessageSound()
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        if (message.chat_id && currentChatIdRef.current && message.chat_id !== currentChatIdRef.current) {
          return prev
        }
        return [...prev, message]
      })
    }

    function onCommunityMessage(message: Message) {
      if (message.sender_id && user?.id && message.sender_id !== user.id) {
        playIncomingMessageSound()
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) return prev
        if (message.channel_id && currentChannelIdRef.current && message.channel_id !== currentChannelIdRef.current) {
          return prev
        }
        return [...prev, message]
      })
    }

    function onTyping(data: any) {
      if (data.userId !== user?.id) {
        setTyping(data.typing)
      }
    }

    socket.on("message_received", onPrivateMessage)
    socket.on("community_message_received", onCommunityMessage)
    socket.on("user_typing", onTyping)

    return () => {
      socket.off("message_received", onPrivateMessage)
      socket.off("community_message_received", onCommunityMessage)
      socket.off("user_typing", onTyping)
    }
  }, [user?.id])

  const title =
    mode === "community"
      ? activeChannel
        ? `COMMUNITY // ${activeChannel.name.toUpperCase()}`
        : "COMMUNITY CHAT"
      : activePlayerName
        ? `PRIVATE // CHAT WITH ${activePlayerName.toUpperCase()}`
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
      <main className="flex h-screen overflow-hidden bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex flex-1 overflow-hidden">
          <aside className="hidden w-96 shrink-0 overflow-hidden border-r-4 border-black bg-[#0E1318] lg:flex lg:flex-col">
            <div className="border-b-4 border-black bg-[#0B0E11] p-6">
              <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                // CHAT_CONTROLLER
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-[#53FC18]">
                Messages
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2 p-4">
              <button
                onClick={() => {
                  setMode("community")
                  setJoinedChatId("")
                  setActivePlayerName("")
                  setTargetUserId("")
                  setMessages([])
                  if (activeChannel) openCommunityChannel(activeChannel)
                }}
                className={`h-11 border-2 border-black text-xs font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  mode === "community" ? "bg-[#53FC18] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-[#191B1F] text-[#53FC18]"
                }`}
              >
                Community
              </button>

              <button
                onClick={() => {
                  setMode("private")
                  setMessages([])
                  setActiveChannel(null)
                  loadFollowedPlayers(true)
                }}
                className={`h-11 border-2 border-black text-xs font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                  mode === "private" ? "bg-[#53FC18] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-[#191B1F] text-[#53FC18]"
                }`}
              >
                Private
              </button>
            </div>

            {mode === "community" ? (
              <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
                {loadingChannels ? (
                  <PanelText text="⌛ LOADING CHANNELS..." />
                ) : channels.length === 0 ? (
                  <PanelText text="❌ BELUM ADA CHANNEL." />
                ) : (
                  <div className="space-y-3">
                    {channels.map((channel) => {
                      const active = activeChannel?.id === channel.id
                      return (
                        <button
                          key={channel.id}
                          onClick={() => openCommunityChannel(channel)}
                          className={`w-full border-2 border-black p-4 text-left transition-all ${
                            active 
                              ? "bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" 
                              : "bg-[#191B1F] text-white hover:bg-black hover:translate-x-1"
                          }`}
                        >
                          <h2 className="text-xs font-black uppercase tracking-tight">
                            {channel.name}
                          </h2> 
                          <p className={`mt-1 text-[10px] font-black uppercase ${active ? "text-black/60" : "text-[#53FC18]"}`}>
                            {channel.games?.genre || "GAME CHANNEL"} • PUBLIC
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3 p-4">
                  <input
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="PLAYER ID"
                    className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase tracking-wider text-white outline-none focus:border-[#53FC18]"
                  />
                  <button
                    onClick={() => startPrivateChat()}
                    disabled={loadingChat}
                    className="h-12 w-full border-2 border-black bg-white text-xs font-black uppercase tracking-widest text-black disabled:opacity-40 active:bg-zinc-200 transition-colors"
                  >
                    {loadingChat ? "CONNECTING..." : "START BY ID"}
                  </button>
                </div>

                <div className="px-4 pb-4">
                  <input
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    placeholder="CARI FOLLOWED PLAYER..."
                    className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase tracking-wider text-white outline-none focus:border-[#53FC18]"
                  />
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 custom-scrollbar">
                  {loadingPlayers ? (
                    <PanelText text="⌛ LOADING FOLLOWED PLAYERS..." />
                  ) : filteredPlayers.length === 0 ? (
                    <PanelText text="❌ BELUM ADA PLAYER YANG KAMU FOLLOW." />
                  ) : (
                    <div className="space-y-3">
                      {filteredPlayers.map((player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          active={targetUserId === player.id}
                          onChat={() => {
                            setTargetUserId(player.id)
                            startPrivateChat(player.id, player.display_name || player.username)
                          }}
                          onProfile={() => handleVisitProfile(player.id)}
                        />
                      ))}
                    </div>
                  )}

                  {hasMorePlayers && !playerSearch && (
                    <button
                      onClick={() => loadFollowedPlayers(false)}
                      disabled={loadingPlayers}
                      className="w-full border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase tracking-widest text-[#53FC18] hover:bg-black disabled:opacity-50 transition-colors"
                    >
                      {loadingPlayers ? "Loading..." : "Load More"}
                    </button>
                  )}
                </div>
              </>
            )}
          </aside>

          <section className="flex flex-1 flex-col bg-[#0B0E11]">
            <div className="flex h-20 items-center justify-between border-b-4 border-black bg-[#0E1318] px-8">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">{title}</h1>
                <p className="text-[10px] font-black uppercase tracking-wide text-zinc-500">{subtitle}</p>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="m-6 border-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase tracking-wider text-red-500 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.2)]"
              >
                ⚠️ SYSTEM_ERROR: {error}
              </motion.div>
            )}

            <div className="flex-1 space-y-4 overflow-y-auto p-8 custom-scrollbar flex flex-col">
              {messages.length === 0 ? (
                <div className="border-2 border-black bg-[#0E1318] p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-600 my-auto">
                  [ NO DATA LOGGED: SESSION MESSAGES EMPTY ]
                </div>
              ) : (
                // AnimatePresence memantau item baru yang masuk ke dalam list
                <AnimatePresence initial={false}>
                  {messages.map((message, index) => (
                    <ChatBubble
                      key={message.id || index}
                      message={message}
                      mine={message.sender_id === user?.id}
                      currentUser={user}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Animasi mikro berdenyut interaktif untuk indikator Typing */}
              <AnimatePresence>
                {typing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex self-start border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]"
                  >
                    <span className="animate-pulse">⚡ TARGET IS TYPING DATA...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Anchor untuk auto-scroll */}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="border-t-4 border-black bg-[#0E1318] p-6">
              <div className="flex items-center gap-4 border-2 border-black bg-[#191B1F] p-2 pr-4 transition-all focus-within:border-[#53FC18] focus-within:shadow-[3px_3px_0px_0px_rgba(83,252,24,0.3)]">
                <input
                  value={content}
                  onChange={(e) => handleTyping(e.target.value)}
                  disabled={mode === "community" ? !activeChannel : !joinedChatId}
                  placeholder={
                    mode === "community"
                      ? activeChannel ? "KIRIM PESAN COMMUNITY..." : "PILIH CHANNEL COMMUNITY..."
                      : joinedChatId ? "KIRIM PESAN PRIVATE..." : "PILIH PLAYER..."
                  }
                  className="h-12 flex-1 bg-transparent px-4 text-xs font-black uppercase tracking-wider text-white outline-none placeholder-zinc-600 disabled:opacity-40"
                />
                <button
                  disabled={mode === "community" ? !activeChannel : !joinedChatId}
                  className="h-10 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black disabled:opacity-40 transition-all active:translate-x-[1px] active:translate-y-[1px]"
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

// --- SUB-KOMPONEN AUXILIARY ---

function PictureProfile({
  src,
  alt,
  avatarBorder,
}: {
  src?: string
  alt: string
  avatarBorder?: any
}) {
  const initial = alt ? alt.charAt(0).toUpperCase() : "?"

  return (
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-zinc-800 font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm tracking-tighter">{initial}</span>
      )}

      {avatarBorder && (
        <div
          className="absolute inset-0 border-2 pointer-events-none"
          style={{
            borderColor: avatarBorder.border_color || "#53FC18",
            boxShadow: avatarBorder.has_glow ? "0 0 8px #53FC18" : "none",
          }}
        />
      )}
    </div>
  )
}

function PanelText({ text }: { text: string }) {
  return (
    <div className="border-2 border-black bg-[#191B1F] p-4 text-center text-xs font-black uppercase text-zinc-500">
      {text}
    </div>
  )
}

function PlayerCard({
  player,
  active,
  onChat,
  onProfile,
}: {
  player: Player
  active: boolean
  onChat: () => void
  onProfile: () => void
}) {
  return (
    <div className={`border-2 border-black p-3 flex items-center justify-between transition-all ${active ? "bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-[#191B1F] text-white hover:border-[#53FC18]"}`}>
      <div className="flex items-center gap-3">
        <PictureProfile
          src={player.avatar_url}
          alt={player.username}
          avatarBorder={player.equipped_avatar_border}
        />
        <div>
          <p className="text-xs font-black uppercase">{player.display_name || player.username}</p>
          <p className={`text-[9px] font-bold uppercase ${active ? "text-black/60" : "text-zinc-500"}`}>
            {player.game_rank || "UNRANKED"}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onChat} className="border border-black bg-black px-2 py-1 text-[10px] font-black uppercase text-[#53FC18] active:scale-95 transition-transform">Chat</button>
        <button onClick={onProfile} className="border border-black bg-zinc-800 px-2 py-1 text-[10px] font-black uppercase text-white active:scale-95 transition-transform">Profile</button>
      </div>
    </div>
  )
}

// SUB KOMPONEN UTAMA YANG DIBERIKAN ANIMASI POP-IN POP-OUT
function ChatBubble({
  message,
  mine,
  currentUser,
}: {
  message: Message
  mine: boolean
  currentUser: any
}) {
  const profile = message.profiles
  
  const username = mine
    ? currentUser?.display_name || currentUser?.username || "YOU"
    : profile?.display_name || profile?.username || "PLAYER"

  const avatarUrl = mine ? currentUser?.avatar_url : profile?.avatar_url
  const borderAsset = mine ? currentUser?.equipped_avatar_border : profile?.equipped_avatar_border

  const text = message.content || message.message || ""

  const timeString = message.created_at
    ? new Date(message.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : ""

  return (
    <motion.div 
      // Efek Spring Hentakan Pop Lembut Khas Arcade Retro saat Data Dimuat/Dikirim
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className={`flex w-full gap-3 ${mine ? "justify-end items-end" : "justify-start items-start"}`}
    >
      {!mine && (
        <PictureProfile src={avatarUrl} alt={username} avatarBorder={borderAsset} />
      )}

      {/* Ditambahkan efek hover interaktif mikro pada bayangan kotak brutalist */}
      <div className={`max-w-md border-2 border-black p-4 select-text transition-all duration-150 ${
        mine 
          ? "bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px]" 
          : "bg-[#191B1F] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_#53FC18] hover:-translate-y-[1px]"
      }`}>
        <div className="flex items-center justify-between gap-8 mb-1">
          <p className="text-[9px] font-black uppercase opacity-60">{username}</p>
          {timeString && (
            <p className="text-[8px] font-bold uppercase opacity-40 tracking-wider">
              {timeString}
            </p>
          )}
        </div>
        {/* break-words digunakan agar string panjang tidak merusak box layout */}
        <p className="text-xs font-bold uppercase break-words leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>

      {mine && (
        <PictureProfile src={avatarUrl} alt={username} avatarBorder={borderAsset} />
      )}
    </motion.div>
  )
}