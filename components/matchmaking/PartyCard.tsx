"use client"

interface PartyMember {
  id: string
  user_id: string
  role_in_game?: string
  is_owner?: boolean
  is_ready?: boolean
  profiles?: {
    username?: string
    display_name?: string
    avatar_url?: string
  }
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
            Rank: {rank} • Region: {region || "GLOBAL"}
          </p>
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
                className="mt-3 border-2 border-black bg-[#53FC18] px-4 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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

      <div className="mt-6 flex flex-wrap gap-3">
        {[...Array(maxPlayers)].map((_, index) => {
          const member = members[index]
          const displayName =
            member?.profiles?.display_name ||
            member?.profiles?.username ||
            member?.user_id ||
            "Empty Slot"

          return (
            <div
              key={index}
              className={`relative flex h-16 w-16 items-center justify-center border-2 border-black ${
                member ? "bg-[#53FC18] text-black" : "bg-[#191B1F] text-zinc-600"
              }`}
              title={displayName}
            >
              {member ? (
                <span className="text-xl font-black">
                  {member.is_owner
                    ? "O"
                    : displayName.charAt(0).toUpperCase()}
                </span>
              ) : (
                "+"
              )}

              {member?.is_owner && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 border border-black bg-yellow-400 px-1 text-[9px] font-black text-black">
                  OWNER
                </span>
              )}
            </div>
          )
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
          className="border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase text-[#53FC18]"
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