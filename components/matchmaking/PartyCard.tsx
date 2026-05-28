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
    <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#53FC18]">
            {game || "UNKNOWN GAME"}
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
            {title}
          </h2>

          <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
            Rank: {rank} • Region: {region || "GLOBAL"} • {players}/{maxPlayers}
          </p>

          {expiresText && (
            <p className="mt-1 text-[10px] font-black uppercase text-yellow-400">
              Auto close: {expiresText}
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="border-2 border-black bg-[#53FC18] px-3 py-1 text-xs font-black uppercase text-black">
            {status || "OPEN"}
          </div>

          <div
            className={`mt-2 border border-black px-2 py-1 text-[10px] font-black uppercase ${
              isPrivate
                ? "bg-yellow-400 text-black"
                : "bg-[#191B1F] text-zinc-400"
            }`}
          >
            {isPrivate ? "PRIVATE" : "PUBLIC"}
          </div>
        </div>
      </div>

      {isPrivate && (
        <div className="mt-5 border-2 border-black bg-[#191B1F] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Private Room Access
          </p>

          {canSeeRoomCode ? (
            <>
              <p className="mt-1 text-xl font-black tracking-widest text-[#53FC18]">
                {roomCode}
              </p>

              <button
                type="button"
                onClick={handleCopyRoomCode}
                className="mt-3 border-2 border-black bg-[#53FC18] px-4 py-2 text-xs font-black uppercase text-black"
              >
                Copy Code
              </button>
            </>
          ) : (
            <>
              <p className="mt-1 text-xs font-black uppercase tracking-widest text-yellow-400">
                Code hidden. Ask owner.
              </p>

              <p className="mt-2 text-[10px] font-bold uppercase text-zinc-500">
                Room ini terlihat publik, tapi join wajib pakai kode.
              </p>
            </>
          )}
        </div>
      )}

      {isOwner && (
        <div className="mt-5 border-2 border-yellow-400 bg-yellow-400 px-3 py-2 text-xs font-black uppercase text-black">
          Kamu adalah owner room ini
        </div>
      )}

      {isMember && !isOwner && (
        <div className="mt-5 border-2 border-[#53FC18] bg-[#53FC18]/10 px-3 py-2 text-xs font-black uppercase text-[#53FC18]">
          Kamu sudah join room ini
        </div>
      )}

      {isCooldown && (
        <div className="mt-5 border-2 border-yellow-500 bg-yellow-500/10 p-3">
          <p className="text-xs font-black uppercase text-yellow-400">
            Owner keluar. Room akan ditutup sekitar {cooldownText || "3 menit"}.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-5">
        {[...Array(maxPlayers)].map((_, index) => {
          const member = members[index]
          return <MemberAvatar key={index} member={member} />
        })}
      </div>

      <div className="mt-7 border-2 border-black bg-[#191B1F] p-4">
        <p className="text-xs font-black uppercase tracking-wider text-yellow-400">
          {missingRoles.length > 0
            ? `Need ${missingRoles.join(", ")}`
            : "All roles filled"}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {!isMember ? (
          <button
            type="button"
            onClick={onJoin}
            className="border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black"
          >
            {isPrivate ? "Use Code" : "Join"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onLeave}
            className="border-2 border-black bg-red-600 py-3 text-xs font-black uppercase text-white"
          >
            Leave
          </button>
        )}

        <button
          type="button"
          onClick={onOpenChat}
          disabled={!isMember}
          className="border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase text-[#53FC18] disabled:text-zinc-600"
        >
          Chat
        </button>

        <button
          type="button"
          disabled
          className="border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase text-zinc-500"
        >
          {isOwner ? "Owner" : isMember ? "Member" : isPrivate ? "Locked" : "Open"}
        </button>
      </div>
    </div>
  )
}

function MemberAvatar({ member }: { member?: PartyMember }) {
  if (!member) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#191B1F] text-xl font-black text-zinc-600">
          +
        </div>

        <p className="max-w-[70px] truncate text-center text-[9px] font-black uppercase text-zinc-600">
          EMPTY
        </p>
      </div>
    )
  }

  const profile = member.profiles

  const displayName =
    profile?.username ||
    profile?.display_name ||
    "Player"

  const avatarUrl = profile?.avatar_url || null
  const avatarBorder = profile?.equipped_avatar_border

  const borderUrl =
    typeof avatarBorder === "string"
      ? avatarBorder
      : avatarBorder?.image_url || null

  return (
    <div className="relative flex flex-col items-center gap-2" title={displayName}>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 overflow-hidden border-2 border-black bg-[#191B1F]">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl font-black uppercase text-[#53FC18]">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {borderUrl && (
          <img
            src={borderUrl}
            alt="Avatar Border"
            className="pointer-events-none absolute inset-[-9px] z-10 h-[82px] w-[82px] object-contain"
          />
        )}

        <div
          className={`absolute -bottom-1 -right-1 z-20 h-4 w-4 border-2 border-black ${
            profile?.online_status ? "bg-[#53FC18]" : "bg-zinc-500"
          }`}
        />
      </div>

      <p className="max-w-[70px] truncate text-center text-[9px] font-black uppercase text-zinc-400">
        {displayName}
      </p>

      {member.is_owner && (
        <span className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 border border-black bg-yellow-400 px-1 text-[8px] font-black text-black">
          OWNER
        </span>
      )}

      {member.role_in_game && (
        <span className="max-w-[78px] truncate border border-black bg-[#0B0E11] px-1.5 py-0.5 text-[8px] font-black uppercase text-[#53FC18]">
          {member.role_in_game}
        </span>
      )}

      {member.is_ready && !member.is_owner && (
        <span className="absolute -top-3 left-1/2 z-30 -translate-x-1/2 border border-black bg-[#53FC18] px-1 text-[8px] font-black text-black">
          READY
        </span>
      )}
    </div>
  )
}