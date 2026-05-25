"use client"

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
  rating?: number
  pro?: boolean
  onViewProfile?: () => void
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
  rating,
  pro,
  onViewProfile,
}: GamerCardProps) {
  return (
    <div className="group relative border-2 border-black bg-[#0E1318] p-5 text-left font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors hover:border-[#53FC18]">
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-4">
            <AvatarWithBorder
              avatar={avatar}
              username={username}
              online={online}
              border={avatarBorder}
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#53FC18]">
                  {username}
                </h2>

                {pro && (
                  <div className="border border-black bg-[#53FC18] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                    PRO
                  </div>
                )}
              </div>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
                {rank}
              </p>

              {game && (
                <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-[#53FC18]/90">
                  🎮 {game}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-[70px] border-2 border-black bg-[#191B1F] px-2.5 py-1.5 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
              RATING
            </p>

            <p className="mt-0.5 text-xs font-black text-[#53FC18]">
              ⭐{rating ? rating.toFixed(1) : "0.0"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <div className="border border-black bg-[#191B1F] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#53FC18]">
            {role}
          </div>

          <div className="border border-black bg-[#191B1F] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            📍 {region || "INDONESIA"}
          </div>

          <div
            className={`border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
              online
                ? "border-black bg-[#53FC18]/10 text-[#53FC18]"
                : "border-black bg-black/40 text-zinc-600"
            }`}
          >
            {online ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button className="flex h-11 items-center justify-center border-2 border-black bg-[#53FC18] text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            ⚡ INVITE
          </button>

          <button
            onClick={() => {
              console.log("GamerCard clicked:", { id, username })

              if (!id) {
                alert("ID player tidak ditemukan")
                return
              }

              onViewProfile?.()
            }}
            className="flex h-11 items-center justify-center border-2 border-[#191B1F] bg-[#0E1318] text-xs font-black uppercase tracking-tight text-white transition-colors hover:border-zinc-700 hover:bg-[#191B1F] active:scale-[0.98]"
          >
            PROFILE
          </button>
        </div>
      </div>
    </div>
  )
}

function AvatarWithBorder({
  avatar,
  username,
  online,
  border,
}: {
  avatar?: string
  username: string
  online?: boolean
  border?: any
}) {
  const borderImage = border?.image_url
  const borderSize = border?.metadata?.borderSize || 10

  return (
    <div className="relative h-20 w-20 flex-shrink-0">
      <div className="absolute left-2 top-2 h-16 w-16 border-2 border-black bg-[#191B1F]">
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-black text-white">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {borderImage && (
        <img
          src={borderImage}
          alt="Avatar Border"
          className="pointer-events-none absolute inset-0 z-10 h-20 w-20 object-contain"
          style={{
            padding: `${borderSize}px`,
          }}
        />
      )}

      {!borderImage && border?.metadata?.borderColor && (
        <div
          className="pointer-events-none absolute left-1 top-1 z-10 h-[72px] w-[72px] border-4"
          style={{
            borderColor: border.metadata.borderColor,
            boxShadow: border.metadata.shadow,
          }}
        />
      )}

      {online && (
        <div className="absolute bottom-1 right-1 z-20 h-4 w-4 border-2 border-black bg-[#53FC18]" />
      )}
    </div>
  )
}