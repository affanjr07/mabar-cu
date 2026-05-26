"use client"

import { MessageSquare, Flame, User, MapPin } from "lucide-react"

interface GamerCardProps {
  id?: string
  username: string
  role: string
  rank: string
  online?: boolean
  avatar?: string
  avatarBorder?: any
  game?: string
  region?: string
  pro?: boolean
  winStreak?: number // Tambahan: Data win streak penambah estetika kompetitif
  lastOnlineText?: string
  onViewProfile?: () => void
  onChat?: () => void // Tambahan: Handler fungsi klik chat
}

export default function GamerCard({
  id,
  username,
  role,
  rank,
  online,
  avatar,
  avatarBorder,
  game,
  region,
  pro,
  winStreak = 3, // Default fallback jika data tidak dikirim
  lastOnlineText,
  onViewProfile,
  onChat,
}: GamerCardProps) {
  const borderUrl =
    typeof avatarBorder === "string"
      ? avatarBorder
      : avatarBorder?.image_url

  return (
    <div className="group relative border-2 border-black bg-[#0E1318] p-5 text-left font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#53FC18] hover:shadow-[6px_6px_0px_0px_rgba(83,252,24,0.15)]">
      
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-5">
          
          {/* AVATAR WRAPPER */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <div className="relative z-10 h-20 w-20 overflow-hidden border-2 border-black bg-[#191B1F]">
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-black uppercase text-white">
                  {username.charAt(0)}
                </div>
              )}
            </div>

            {borderUrl && (
              <img
                src={borderUrl}
                alt="avatar border"
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-28 w-28 -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            )}

            {online && (
              <div className="absolute bottom-3 right-3 z-30 h-4 w-4 border-2 border-black bg-[#53FC18] animate-pulse" />
            )}
          </div>

          {/* USER INFO */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#53FC18] transition-colors">
                {username}
              </h2>

              {pro && (
                <div className="border border-black bg-[#53FC18] px-1.5 py-0.5 text-[9px] font-black uppercase text-black animate-bounce [animation-duration:3s]">
                  PRO
                </div>
              )}
            </div>

            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
              {rank}
            </p>

            {game && (
              <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-[#53FC18]">
                🎮 {game}
              </p>
            )}

            {!online && lastOnlineText && (
              <p className="mt-1 text-[10px] font-black uppercase text-zinc-500">
                {lastOnlineText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* METADATA TAGS */}
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="border border-black bg-[#191B1F] px-2.5 py-1 text-[10px] font-black uppercase text-[#53FC18]">
          {role}
        </div>

        <div className="border border-black bg-[#191B1F] px-2.5 py-1 text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1">
          <MapPin size={10} />
          {region || "Indonesia"}
        </div>

        <div
          className={`border border-black px-2.5 py-1 text-[10px] font-black uppercase ${
            online ? "bg-[#53FC18]/10 text-[#53FC18]" : "bg-black/40 text-zinc-600"
          }`}
        >
          {online ? "Online" : "Offline"}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {/* BUTTON 1: CHAT SYSTEM */}
        <button 
          onClick={() => {
            if (!id) return alert("Room chat tidak tersedia")
            onChat?.()
          }}
          className="flex h-11 items-center justify-center gap-2 border-2 border-black bg-[#53FC18] text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]"
        >
          <MessageSquare size={14} className="stroke-[2.5]" />
          Chat
        </button>

        {/* BUTTON 2: VIEW PROFILE */}
        <button
          onClick={() => {
            if (!id) {
              alert("ID player tidak ditemukan")
              return
            }
            onViewProfile?.()
          }}
          className="flex h-11 items-center justify-center gap-1.5 border-2 border-[#191B1F] bg-[#0E1318] text-xs font-black uppercase text-white transition-colors hover:bg-[#191B1F] hover:border-zinc-700"
        >
          <User size={14} />
          Profile
        </button>
      </div>
    </div>
  )
}