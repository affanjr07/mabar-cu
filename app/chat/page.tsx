"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MabarLoading from "@/components/ui/MabarLoading"
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
import { MessageSquare, X } from "lucide-react"

interface Message {
  id?: string
  chat_id?: string
  channel_id?: string
  sender_id?: string
  content?: string
  message?: string
  image_url?: string
  sticker_url?: string
  message_type?: string
  is_flagged?: boolean
  created_at?: string
  profiles?: {
    id?: string
    username?: string
    display_name?: string
    avatar_url?: string
    equipped_avatar_border?: any
    equipped_badges?: any[]
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
  const user = useAuthStore((state) => state.user) as any

  const [mode, setMode] = useState<ChatMode>("community")
  const [targetUserId, setTargetUserId] = useState("")
  const [playerSearch, setPlayerSearch] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [playersOffset, setPlayersOffset] = useState(0)
  const [hasMorePlayers, setHasMorePlayers] = useState(true)

  const [channels, setChannels] = useState<CommunityChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<CommunityChannel | null>(
    null
  )

  const [joinedChatId, setJoinedChatId] = useState("")
  const [activePlayerName, setActivePlayerName] = useState("")

  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState("")
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState("")
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingChannels, setLoadingChannels] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const playerLimit = 15
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  function playIncomingMessageSound() {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext

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
    } catch {}
  }

  function syncMessages(nextMessages: Message[]) {
    setMessages((prev) => {
      const prevLastId = prev[prev.length - 1]?.id
      const nextLastId = nextMessages[nextMessages.length - 1]?.id

      if (prevLastId !== nextLastId && prev.length > 0) {
        const newest = nextMessages[nextMessages.length - 1]

        if (newest?.sender_id && newest.sender_id !== user?.id) {
          playIncomingMessageSound()
        }
      }

      if (JSON.stringify(prev) === JSON.stringify(nextMessages)) return prev
      return nextMessages
    })
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
      setError(
        error.response?.data?.message || "GAGAL MENGAMBIL FOLLOWED PLAYER."
      )
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
      setError(
        error.response?.data?.message || "GAGAL MENGAMBIL COMMUNITY CHANNEL."
      )
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
      setIsSidebarOpen(false)

      const data = await getCommunityMessages(channel.id)
      syncMessages(data || [])
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
      setIsSidebarOpen(false)

      const privateChat = await createPrivateChat(selectedTargetId)
      const chatId = privateChat.chat.id

      setJoinedChatId(chatId)
      setActivePlayerName(name || selectedTargetId)

      const data = await getChatMessages(chatId)
      syncMessages(data || [])
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "GAGAL MEMULAI CHAT. PASTIKAN KAMU SUDAH FOLLOW PLAYER INI."
      )
    } finally {
      setLoadingChat(false)
    }
  }

  async function reloadCurrentMessages() {
    try {
      if (mode === "community" && activeChannel?.id) {
        const data = await getCommunityMessages(activeChannel.id)
        syncMessages(data || [])
      }

      if (mode === "private" && joinedChatId) {
        const data = await getChatMessages(joinedChatId)
        syncMessages(data || [])
      }
    } catch {}
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
        const latest = await getCommunityMessages(activeChannel.id)
        syncMessages(latest || [])
      }

      if (mode === "private") {
        if (!joinedChatId) return

        await sendChatMessage(joinedChatId, {
          content,
          message_type: "text",
        })

        const latest = await getChatMessages(joinedChatId)
        syncMessages(latest || [])
      }

      setContent("")
      setTyping(false)
    } catch (error: any) {
      if (error.response?.data?.code === "USER_MUTED") {
        const data = error.response.data
        const until = data.muted_until
          ? new Date(data.muted_until).toLocaleString("id-ID")
          : "Permanen"

        setError(`KAMU SEDANG DIMUTE. ALASAN: ${data.reason}. SAMPAI: ${until}`)
        return
      }

      setError(error.response?.data?.message || "GAGAL MENGIRIM PESAN.")
    }
  }

  function handleTyping(value: string) {
    setContent(value)
  }

  function handleVisitProfile(playerId: string) {
    router.push(`/users/${playerId}`)
  }

  const filteredPlayers = players.filter((player) => {
    const keyword = playerSearch.toLowerCase()
    const name = `${player.username || ""} ${
      player.display_name || ""
    }`.toLowerCase()

    return name.includes(keyword)
  })

  useEffect(() => {
    async function initChatPage() {
      try {
        setInitialLoading(true)

        await Promise.all([loadFollowedPlayers(true), loadCommunityChannels()])
      } finally {
        setInitialLoading(false)
      }
    }

    initChatPage()
  }, [])

  useEffect(() => {
    if (mode !== "community") return
    if (!activeChannel?.id) return

    const interval = setInterval(() => {
      reloadCurrentMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [mode, activeChannel?.id])

  useEffect(() => {
    if (mode !== "private") return
    if (!joinedChatId) return

    const interval = setInterval(() => {
      reloadCurrentMessages()
    }, 2000)

    return () => clearInterval(interval)
  }, [mode, joinedChatId])

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

  const renderChatController = () => (
    <>
      <div className="flex items-center justify-between border-b-4 border-black bg-[#0B0E11] p-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            // CHAT_CONTROLLER
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-[#53FC18]">
            Messages
          </h1>
        </div>

        <button
          onClick={() => setIsSidebarOpen(false)}
          className="border-2 border-black bg-zinc-900 p-2 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:hidden"
        >
          <X size={16} className="stroke-[2.5]" />
        </button>
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
            mode === "community"
              ? "bg-[#53FC18] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
            loadFollowedPlayers(true)
          }}
          className={`h-11 border-2 border-black text-xs font-black uppercase transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            mode === "private"
              ? "bg-[#53FC18] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "bg-[#191B1F] text-[#53FC18]"
          }`}
        >
          Private
        </button>
      </div>

      {mode === "community" ? (
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
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
                        : "bg-[#191B1F] text-white hover:translate-x-1 hover:bg-black"
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
              className="h-12 w-full border-2 border-black bg-white text-xs font-black uppercase tracking-widest text-black transition-colors active:bg-zinc-200 disabled:opacity-40"
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

          <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-4">
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
                      startPrivateChat(
                        player.id,
                        player.display_name || player.username
                      )
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
                className="w-full border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase tracking-widest text-[#53FC18] transition-colors hover:bg-black disabled:opacity-50"
              >
                {loadingPlayers ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </>
      )}
    </>
  )

  if (initialLoading) {
    return (
      <ProtectedRoute>
        <main className="flex h-screen overflow-hidden bg-[#0B0E11] pb-16 font-mono text-white lg:pb-0">
          <Sidebar />

          <section className="flex flex-1 items-center justify-center">
            <MabarLoading mode="section" />
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="flex h-screen overflow-hidden bg-[#0B0E11] pb-16 font-mono text-white lg:pb-0">
        <Sidebar />

        <section className="relative flex flex-1 overflow-hidden">
          <aside className="hidden w-96 shrink-0 overflow-hidden border-r-4 border-black bg-[#0E1318] lg:flex lg:flex-col">
            {renderChatController()}
          </aside>

          <AnimatePresence>
            {isSidebarOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-xs"
                  onClick={() => setIsSidebarOpen(false)}
                />

                <motion.aside
                  initial={{ translateX: "-100%" }}
                  animate={{ translateX: 0 }}
                  exit={{ translateX: "-100%" }}
                  transition={{ type: "tween", duration: 0.25 }}
                  className="relative z-10 flex h-full w-80 max-w-[85vw] flex-col overflow-hidden border-r-4 border-black bg-[#0E1318] shadow-[4px_0px_0px_0px_rgba(0,0,0,1)]"
                >
                  {renderChatController()}
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          <section className="flex flex-1 flex-col bg-[#0B0E11]">
            <div className="flex h-20 items-center justify-between border-b-4 border-black bg-[#0E1318] px-4 md:px-8">
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-sm font-black uppercase tracking-tight md:text-xl">
                  {title}
                </h1>

                <p className="truncate text-[9px] font-black uppercase tracking-wide text-zinc-500 md:text-[10px]">
                  {subtitle}
                </p>
              </div>

              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center gap-1.5 border-2 border-black bg-[#53FC18] px-3 py-2 text-[10px] font-black uppercase tracking-tight text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none lg:hidden"
              >
                <MessageSquare size={14} className="stroke-[2.5]" />
                <span>Channels</span>
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="m-4 border-2 border-black bg-red-950/40 p-4 text-xs font-black uppercase tracking-wider text-red-500 shadow-[3px_3px_0px_0px_rgba(239,68,68,0.2)] md:m-6"
              >
                ⚠️ SYSTEM_ERROR: {error}
              </motion.div>
            )}

            <div className="custom-scrollbar flex flex-1 flex-col space-y-4 overflow-y-auto p-4 md:p-8">
              {messages.length === 0 ? (
                <div className="my-auto border-2 border-black bg-[#0E1318] p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-600">
                  [ NO DATA LOGGED: SESSION MESSAGES EMPTY ]
                </div>
              ) : (
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

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex self-start border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]"
                  >
                    <span className="animate-pulse">
                      ⚡ TARGET IS TYPING DATA...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="border-t-4 border-black bg-[#0E1318] p-4 md:p-6"
            >
              <div className="flex items-center gap-2 border-2 border-black bg-[#191B1F] p-2 pr-2 transition-all focus-within:border-[#53FC18] focus-within:shadow-[3px_3px_0px_0px_rgba(83,252,24,0.3)] md:gap-4 md:pr-4">
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
                  className="h-12 flex-1 bg-transparent px-2 text-xs font-black uppercase tracking-wider text-white outline-none placeholder-zinc-600 disabled:opacity-40 md:px-4"
                />

                <button
                  disabled={mode === "community" ? !activeChannel : !joinedChatId}
                  className="h-10 border-2 border-black bg-[#53FC18] px-4 text-xs font-black uppercase tracking-widest text-black transition-all active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-40 md:px-6"
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
  const borderImage = avatarBorder?.image_url || null

  return (
    <div className="relative h-12 w-12 shrink-0">
      <div className="absolute inset-[5px] z-10 flex items-center justify-center overflow-hidden border-2 border-black bg-zinc-800 font-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {src ? (
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm tracking-tighter">{initial}</span>
        )}
      </div>

      {borderImage && (
        <img
          src={borderImage}
          alt={avatarBorder?.name || "Avatar Border"}
          className="pointer-events-none absolute inset-0 z-20 h-full w-full object-contain"
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
    <div
      className={`flex items-center justify-between border-2 border-black p-3 transition-all ${
        active
          ? "bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          : "bg-[#191B1F] text-white hover:border-[#53FC18]"
      }`}
    >
      <div className="mr-2 flex min-w-0 flex-1 items-center gap-3">
        <PictureProfile
          src={player.avatar_url}
          alt={player.username}
          avatarBorder={player.equipped_avatar_border}
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black uppercase">
            {player.display_name || player.username}
          </p>

          <p
            className={`truncate text-[9px] font-bold uppercase ${
              active ? "text-black/60" : "text-zinc-500"
            }`}
          >
            {player.game_rank || "UNRANKED"}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-1.5">
        <button
          onClick={onChat}
          className="border border-black bg-black px-2 py-1 text-[10px] font-black uppercase text-[#53FC18] transition-transform active:scale-95"
        >
          Chat
        </button>

        <button
          onClick={onProfile}
          className="border border-black bg-zinc-800 px-2 py-1 text-[10px] font-black uppercase text-white transition-transform active:scale-95"
        >
          Profile
        </button>
      </div>
    </div>
  )
}

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

  const username =
    profile?.display_name ||
    profile?.username ||
    currentUser?.display_name ||
    currentUser?.username ||
    currentUser?.email?.split("@")?.[0] ||
    (mine ? "YOU" : "PLAYER")

  const avatarUrl = profile?.avatar_url || currentUser?.avatar_url || ""
  const borderAsset =
    profile?.equipped_avatar_border ||
    currentUser?.equipped_avatar_border ||
    null

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
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 350, damping: 26 }}
      className={`flex w-full gap-2 md:gap-3 ${
        mine ? "items-end justify-end" : "items-start justify-start"
      }`}
    >
      {!mine && (
        <PictureProfile
          src={avatarUrl}
          alt={username}
          avatarBorder={borderAsset}
        />
      )}

      <div
        className={`max-w-[75%] select-text border-2 border-black p-3 transition-all duration-150 md:max-w-md md:p-4 ${
          mine
            ? "bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            : "bg-[#191B1F] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        }`}
      >
        <div className="mb-2 flex items-center justify-between gap-4 md:gap-8">
          <p
            className={`max-w-[160px] truncate text-[10px] font-black uppercase tracking-wider ${
              mine ? "text-black/60" : "text-[#53FC18]"
            }`}
          >
            @{username}
          </p>

          {timeString && (
            <p
              className={`shrink-0 border border-black px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                mine ? "bg-black/10 text-black/50" : "bg-black text-zinc-400"
              }`}
            >
              {timeString}
            </p>
          )}
        </div>

        <p className="whitespace-pre-wrap break-words text-xs font-bold uppercase leading-relaxed">
          {text}
        </p>
      </div>

      {mine && (
        <PictureProfile
          src={avatarUrl}
          alt={username}
          avatarBorder={borderAsset}
        />
      )}
    </motion.div>
  )
}