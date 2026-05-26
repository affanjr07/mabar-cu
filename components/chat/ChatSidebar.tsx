"use client"

import { useEffect, useState } from "react"
import { getFollowedPlayers } from "@/services/player.service"

interface Player {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  online_status?: boolean
  last_online_text?: string
  preferred_role?: string
  game_rank?: string
  equipped_avatar_border?: any
}

interface ChatSidebarProps {
  activeUserId?: string
  onSelectPlayer?: (player: Player) => void
}

export default function ChatSidebar({
  activeUserId,
  onSelectPlayer,
}: ChatSidebarProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const limit = 15

  async function loadPlayers(reset = false) {
    try {
      setLoading(true)

      const nextOffset = reset ? 0 : offset
      const data = await getFollowedPlayers(limit, nextOffset)

      if (reset) {
        setPlayers(data || [])
        setOffset(limit)
      } else {
        setPlayers((prev) => [...prev, ...(data || [])])
        setOffset((prev) => prev + limit)
      }

      setHasMore((data || []).length === limit)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlayers(true)
  }, [])

  return (
    <aside className="hidden w-80 border-r-4 border-black bg-[#0E1318] font-mono text-white lg:block">
      <div className="border-b-4 border-black bg-[#0B0E11] p-6">
        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          // FOLLOWED_PLAYERS
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight text-[#53FC18]">
          Messages
        </h1>

        <p className="mt-2 text-[10px] font-black uppercase text-zinc-500">
          Hanya player yang kamu follow.
        </p>
      </div>

      <div className="divide-y-2 divide-black">
        {players.length === 0 && !loading ? (
          <div className="p-5 text-xs font-black uppercase text-zinc-500">
            Belum ada player yang kamu follow.
          </div>
        ) : (
          players.map((player) => {
            const name = player.display_name || player.username
            const active = activeUserId === player.id
            const borderUrl =
              typeof player.equipped_avatar_border === "string"
                ? player.equipped_avatar_border
                : player.equipped_avatar_border?.image_url

            return (
              <button
                key={player.id}
                onClick={() => onSelectPlayer?.(player)}
                className={`group flex w-full items-center gap-4 p-4 text-left transition-all ${
                  active
                    ? "bg-[#53FC18] text-black"
                    : "bg-[#0E1318] hover:bg-black"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="h-12 w-12 border-2 border-black bg-[#191B1F]">
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-black uppercase text-zinc-500">
                        {name.substring(0, 2)}
                      </div>
                    )}
                  </div>

                  {borderUrl && (
                    <img
                      src={borderUrl}
                      alt="border"
                      className="pointer-events-none absolute inset-[-6px] z-10 h-[60px] w-[60px] object-contain"
                    />
                  )}

                  <div
                    className={`absolute -bottom-1 -right-1 z-20 border border-black px-1 text-[8px] font-black uppercase ${
                      player.online_status
                        ? "bg-[#53FC18] text-black"
                        : "bg-zinc-600 text-zinc-300"
                    }`}
                  >
                    {player.online_status ? "ON" : "OF"}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h2
                    className={`truncate text-sm font-black uppercase ${
                      active
                        ? "text-black"
                        : "text-white group-hover:text-[#53FC18]"
                    }`}
                  >
                    {name}
                  </h2>

                  <p
                    className={`mt-1 truncate text-[10px] font-black uppercase ${
                      player.online_status
                        ? active
                          ? "text-black/70"
                          : "text-[#53FC18]"
                        : active
                          ? "text-black/60"
                          : "text-zinc-500"
                    }`}
                  >
                    {player.online_status
                      ? "ONLINE // ACTIVE"
                      : player.last_online_text || "OFFLINE"}
                  </p>
                </div>

                <div
                  className={`pr-1 text-xs font-black ${
                    active ? "text-black" : "text-zinc-700 group-hover:text-white"
                  }`}
                >
                  &rarr;
                </div>
              </button>
            )
          })
        )}

        {hasMore && (
          <button
            onClick={() => loadPlayers(false)}
            disabled={loading}
            className="w-full bg-[#191B1F] p-4 text-xs font-black uppercase tracking-widest text-[#53FC18] hover:bg-black disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </aside>
  )
}