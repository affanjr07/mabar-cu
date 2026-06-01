"use client"

interface AvatarBorder {
  image_url?: string
  name?: string
}

interface PartyMember {
  id: string
  user_id: string
  role_in_game?: string
  is_owner?: boolean
  is_ready?: boolean
  profiles?: {
    username?: string
    display_name?: string
    avatar_url?: string | null
    online_status?: boolean
    equipped_avatar_border?: string | AvatarBorder | null
  } | null
}

interface PartyCardProps {
  id: string
  title: string
  rank: string
  players?: number
  maxPlayers: number
  missingRoles?: string[]
  game?: string
  region?: string
  status?: string
  roomType?: string
  roomCode?: string
  cooldownUntil?: string
  expiresAt?: string
  members?: PartyMember[]
  isMember?: boolean
  isOwner?: boolean
  onJoin?: () => void
  onLeave?: () => void
  onOpenChat?: () => void
}

export default function PartyCard({
  title,
  rank,
  players = 0,
  maxPlayers,
  missingRoles = [],
  game,
  region,
  status,
  roomType,
  roomCode,
  cooldownUntil,
  expiresAt,
  members = [],
  isMember,
  isOwner,
  onJoin,
  onLeave,
  onOpenChat,
}: PartyCardProps) {
  const isCooldown = status === "cooldown"
  const isPrivate = roomType === "private"
  const canSeeRoomCode = isPrivate && (isOwner || isMember) && roomCode

  const cooldownText = cooldownUntil
    ? new Date(cooldownUntil).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  const expiresText = expiresAt
    ? new Date(expiresAt).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null

  async function handleCopyRoomCode() {
    if (!roomCode) return
    await navigator.clipboard.writeText(roomCode)
    alert(`Room code disalin: ${roomCode}`)
  }

  return (
    <div className="flex flex-col justify-between border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 w-full font-mono text-white">
      
      <div>
        {/* HEADER SECTION */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#53FC18] truncate">
              {game || "UNKNOWN GAME"}
            </p>

            <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black uppercase tracking-tight break-words line-clamp-2">
              {title}
            </h2>

            <p className="mt-1.5 text-[11px] sm:text-xs font-bold uppercase text-zinc-500 leading-relaxed">
              Rank: <span className="text-zinc-300">{rank}</span> • Region: <span className="text-zinc-300">{region || "GLOBAL"}</span> • <span className="text-[#53FC18]">{players}/{maxPlayers}</span>
            </p>

            {expiresText && (
              <p className="mt-1 text-[9px] sm:text-[10px] font-black uppercase text-yellow-400">
                ⏳ Auto close: {expiresText}
              </p>
            )}
          </div>

          {/* STATUS BADGES */}
          <div className="flex flex-col items-end shrink-0 gap-1.5">
            <div className="border-2 border-black bg-[#53FC18] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {status || "OPEN"}
            </div>

            <div
              className={`border border-black px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase ${
                isPrivate ? "bg-yellow-400 text-black" : "bg-[#191B1F] text-zinc-400"
              }`}
            >
              {isPrivate ? "PRIVATE" : "PUBLIC"}
            </div>
          </div>
        </div>

        {/* PRIVATE ROOM ACCESS CONTAINER */}
        {isPrivate && (
          <div className="mt-4 border-2 border-black bg-[#191B1F] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
              🔒 Private Room Access
            </p>

            {canSeeRoomCode ? (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-lg sm:text-xl font-black tracking-widest text-[#53FC18] bg-black/40 px-2 py-0.5 border border-zinc-800">
                  {roomCode}
                </p>

                <button
                  type="button"
                  onClick={handleCopyRoomCode}
                  className="border-2 border-black bg-[#53FC18] px-3 py-1 text-[11px] font-black uppercase text-black active:translate-y-0.5"
                >
                  Copy Code
                </button>
              </div>
            ) : (
              <div className="mt-1">
                <p className="text-[11px] font-black uppercase text-yellow-400">
                  Code hidden. Ask owner.
                </p>
                <p className="mt-1 text-[9px] font-bold uppercase text-zinc-500 leading-tight">
                  Room ini terlihat publik, tapi join wajib pakai kode.
                </p>
              </div>
            )}
          </div>
        )}

        {/* METADATA STATUS NOTICES */}
        {isOwner && (
          <div className="mt-4 border-2 border-yellow-400 bg-yellow-400/10 px-3 py-1.5 text-[11px] font-black uppercase text-yellow-400">
            👑 Kamu adalah owner room ini
          </div>
        )}

        {isMember && !isOwner && (
          <div className="mt-4 border-2 border-`[#53FC18]` border-[#53FC18] bg-[#53FC18]/10 px-3 py-1.5 text-[11px] font-black uppercase text-[#53FC18]">
            ✅ Kamu sudah join room ini
          </div>
        )}

        {isCooldown && (
          <div className="mt-4 border-2 border-red-500 bg-red-500/10 p-3">
            <p className="text-[11px] font-black uppercase text-red-400 leading-snug">
              ⚠️ Owner keluar. Room ditutup dalam {cooldownText || "3 menit"}.
            </p>
          </div>
        )}

        {/* GRID MEMBERS AVATAR - Responsif Menggunakan Auto-Grid */}
        <div className="mt-5 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 sm:gap-4 bg-[#14191E]/40 p-3 border border-black/40">
          {[...Array(maxPlayers)].map((_, index) => {
            const member = members[index]
            return <MemberAvatar key={index} member={member} />
          })}
        </div>

        {/* MISSING ROLES TAG */}
        <div className="mt-4 border-2 border-black bg-[#191B1F] p-3 text-center sm:text-left">
          <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
            {missingRoles.length > 0
              ? `🎯 Need: ${missingRoles.join(", ")}`
              : "🔥 All roles filled"}
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS - Responsif Flex-Col ke Grid */}
      <div className="mt-5 flex flex-col sm:grid sm:grid-cols-3 gap-2.5">
        {!isMember ? (
          <button
            type="button"
            onClick={onJoin}
            className="w-full h-11 border-2 border-black bg-[#53FC18] text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]"
          >
            {isPrivate ? "Use Code" : "Join Party"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onLeave}
            className="w-full h-11 border-2 border-black bg-red-600 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700"
          >
            Leave
          </button>
        )}

        <button
          type="button"
          onClick={onOpenChat}
          disabled={!isMember}
          className="w-full h-11 border-2 border-black bg-[#191B1F] text-xs font-black uppercase text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:text-zinc-600 disabled:opacity-40 hover:bg-zinc-900"
        >
          Chat Lobby
        </button>

        <button
          type="button"
          disabled
          className="w-full h-11 border-2 border-black bg-[#0E1318] text-xs font-black uppercase text-zinc-500 border-dashed"
        >
          {isOwner ? "Room Owner" : isMember ? "Joined" : isPrivate ? "Locked" : "Available"}
        </button>
      </div>

    </div>
  )
}

/* SUB-KOMPONEN MEMBER AVATAR */
function MemberAvatar({ member }: { member?: PartyMember }) {
  if (!member) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-1">
        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center border-2 border-black bg-[#191B1F] text-base font-black text-zinc-700 select-none">
          +
        </div>
        <p className="w-full truncate text-center text-[8px] font-black uppercase text-zinc-600">
          EMPTY
        </p>
      </div>
    )
  }

  const profile = member.profiles
  const displayName = profile?.username || profile?.display_name || "Player"
  const avatarUrl = profile?.avatar_url || null
  const avatarBorder = profile?.equipped_avatar_border

  const borderUrl =
    typeof avatarBorder === "string"
      ? avatarBorder
      : avatarBorder?.image_url || null

  return (
    <div className="relative flex flex-col items-center gap-1.5 py-1" title={displayName}>
      <div className="relative h-11 w-11 sm:h-12 sm:w-12 shrink-0">
        <div className="absolute inset-0 overflow-hidden border-2 border-black bg-[#191B1F]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-[#53FC18]">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {borderUrl && (
          <img
            src={borderUrl}
            alt="Avatar Border"
            className="pointer-events-none absolute inset-[-6px] sm:inset-[-7px] z-10 h-[55px] w-[55px] sm:h-[60px] sm:w-[60px] object-contain"
          />
        )}

        <div
          className={`absolute -bottom-0.5 -right-0.5 z-20 h-3 w-3 border-2 border-black ${
            profile?.online_status ? "bg-[#53FC18]" : "bg-zinc-500"
          }`}
        />
      </div>

      <p className="w-full truncate text-center text-[8px] font-black uppercase text-zinc-400">
        {displayName}
      </p>

      {/* FLOATING MINI STATUS LABELS */}
      {member.is_owner && (
        <span className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 border border-black bg-yellow-400 px-0.5 text-[7px] font-black text-black scale-90">
          OWNER
        </span>
      )}

      {member.is_ready && !member.is_owner && (
        <span className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 border border-black bg-[#53FC18] px-0.5 text-[7px] font-black text-black scale-90">
          READY
        </span>
      )}

      {member.role_in_game && (
        <span className="w-full truncate text-center border border-black bg-black/60 px-1 text-[7px] font-black uppercase text-[#53FC18] scale-95 mt-0.5">
          {member.role_in_game}
        </span>
      )}
    </div>
  )
}