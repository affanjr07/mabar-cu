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
  winStreak?: number
  lastOnlineText?: string
  onViewProfile?: () => void
  onChat?: () => void
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
  winStreak = 3,
  lastOnlineText,
  onViewProfile,
  onChat,
}: GamerCardProps) {
  const borderUrl =
    typeof avatarBorder === "string"
      ? avatarBorder
      : avatarBorder?.image_url

  return (
    <div className="group relative flex h-full flex-col justify-between border-2 border-black bg-[#0E1318] p-3 sm:p-5 text-left font-mono shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#53FC18] hover:shadow-[5px_5px_0px_0px_rgba(83,252,24,0.15)] w-full">
      
      <div>
        <div className="flex items-start gap-2.5 sm:gap-4">
          
          {/* AVATAR WRAPPER - Diperkecil untuk mobile agar muat 2 kolom */}
          <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center">
            <div className="relative z-10 h-11 w-11 sm:h-16 sm:w-16 overflow-hidden border-2 border-black bg-[#191B1F]">
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base sm:text-xl font-black uppercase text-white">
                  {username.charAt(0)}
                </div>
              )}
            </div>

            {borderUrl && (
              <img
                src={borderUrl}
                alt="avatar border"
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-16 w-16 sm:h-22 sm:w-22 -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            )}

            {online && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-30 h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 border border-black bg-[#53FC18] animate-pulse" />
            )}
          </div>

          {/* USER INFO - Ditambahkan truncate ketat agar tidak merusak layout */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 max-w-full">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-tight text-white group-hover:text-[#53FC18] transition-colors truncate">
                {username}
              </h2>

              {pro && (
                <div className="shrink-0 border border-black bg-[#53FC18] px-0.5 text-[7px] sm:text-[8px] font-black uppercase text-black animate-bounce [animation-duration:3s]">
                  PRO
                </div>
              )}
            </div>

            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 truncate">
              {rank}
            </p>

            {game && (
              <p className="mt-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wide text-[#53FC18] truncate">
                🎮 {game}
              </p>
            )}

            {!online && lastOnlineText && (
              <p className="mt-0.5 text-[9px] sm:text-[10px] font-black uppercase text-zinc-500 truncate">
                {lastOnlineText}
              </p>
            )}
          </div>
        </div>

        {/* METADATA TAGS & WIN STREAK BADGE - Wrap aman untuk layar kecil */}
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
          <div className="border border-black bg-[#191B1F] px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase text-[#53FC18] truncate max-w-[80px] sm:max-w-none">
            {role}
          </div>

          <div className="border border-black bg-[#191B1F] px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 flex items-center gap-0.5 sm:gap-1">
            <MapPin size={8} className="sm:size-[10px]" />
            <span className="truncate max-w-[40px] sm:max-w-[70px]">{region || "IDN"}</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS - Responsif, text mengecil di mobile */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
        <button 
          onClick={() => {
            if (!id) return alert("Room chat tidak tersedia")
            onChat?.()
          }}
          className="flex h-9 sm:h-11 items-center justify-center gap-1 border-2 border-black bg-[#53FC18] text-[10px] sm:text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]"
        >
          <MessageSquare size={11} className="sm:size-[13px] stroke-[2.5]" />
          Chat
        </button>

        <button
          onClick={() => {
            if (!id) return alert("ID player tidak ditemukan")
            onViewProfile?.()
          }}
          className="flex h-9 sm:h-11 items-center justify-center gap-1 border-2 border-[#191B1F] bg-[#0E1318] text-[10px] sm:text-xs font-black uppercase text-white transition-colors hover:bg-[#191B1F] hover:border-zinc-700"
        >
          <User size={11} className="sm:size-[13px]" />
          Profile
        </button>
      </div>

    </div>
  )
}