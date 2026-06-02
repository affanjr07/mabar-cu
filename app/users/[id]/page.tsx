"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { getPublicProfile } from "@/services/profile.service"
import { api } from "@/lib/axios"
import MabarLoading from "@/components/ui/MabarLoading"

interface ShopItem {
  id?: string
  name?: string
  type?: string
  image_url?: string | null
  rarity?: string
  css_class?: string | null
  metadata?: any
}

interface PublicProfile {
  id: string
  username: string
  display_name?: string
  avatar_url?: string | null
  banner_url?: string | null
  bio?: string | null
  gender?: string | null
  role?: "user" | "admin" | "pro_player" | string
  favorite_game?: string | null
  game_rank?: string | null
  preferred_role?: string | null
  region?: string | null
  online_status?: boolean
  last_online_text?: string | null
  followers_count?: number
  following_count?: number
  average_rating?: number
  total_ratings?: number
  badges?: string[]
  equipped_avatar_border?: ShopItem | null
  equipped_badges?: ShopItem[]
  is_following?: boolean
  is_own_profile?: boolean
}

function parseMetadata(metadata: any) {
  if (!metadata) return {}

  if (typeof metadata === "object") return metadata

  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

function getBadgeColor(color?: string) {
  switch (color) {
    case "red":
      return "bg-red-500 text-white shadow-[0_0_18px_rgba(239,68,68,0.8)]"
    case "blue":
      return "bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,0.8)]"
    case "green":
      return "bg-green-500 text-black shadow-[0_0_18px_rgba(34,197,94,0.8)]"
    case "purple":
      return "bg-purple-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.8)]"
    case "orange":
      return "bg-orange-500 text-black shadow-[0_0_18px_rgba(249,115,22,0.8)]"
    case "gold":
    case "yellow":
      return "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,0.8)]"
    case "cyan":
      return "bg-cyan-400 text-black shadow-[0_0_18px_rgba(34,211,238,0.8)]"
    default:
      return "bg-[#53FC18] text-black shadow-[0_0_14px_rgba(83,252,24,0.5)]"
  }
}

function getRoleStyle(role?: string) {
  if (role === "admin") {
    return "border-yellow-400 bg-yellow-400 text-black shadow-[0_0_22px_rgba(250,204,21,0.45)]"
  }

  if (role === "pro_player") {
    return "border-[#53FC18] bg-[#53FC18] text-black shadow-[0_0_22px_rgba(83,252,24,0.35)]"
  }

  return "border-zinc-700 bg-[#191B1F] text-zinc-400"
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()

  const identifier = params.id as string

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)

  async function loadProfile() {
    if (!identifier) return

    try {
      setLoading(true)
      setMessage("")

      const data = await getPublicProfile(identifier)

      setProfile(data)
      setIsFollowing(Boolean(data?.is_following))
    } catch (error: any) {
      console.log("PROFILE FETCH ERROR:", error.response?.data || error.message)
      setProfile(null)
      setIsFollowing(false)
    } finally {
      setLoading(false)
    }
  }

  async function handleFollow() {
    if (!profile) return

    try {
      setActionLoading(true)
      setMessage("")

      if (isFollowing) {
        await api.delete(`/social/follow/${profile.id}`)
        setMessage("PLAYER BERHASIL DI-UNFOLLOW.")
      } else {
        await api.post(`/social/follow/${profile.id}`)
        setMessage("⚡ BERHASIL FOLLOW PLAYER INI!")
      }

      await loadProfile()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "AKSI FOLLOW GAGAL.")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBlock() {
    if (!profile) return

    const targetName = profile.display_name || profile.username
    const confirmBlock = confirm(`YAKIN INGIN BLOCK ${targetName.toUpperCase()}?`)

    if (!confirmBlock) return

    try {
      setActionLoading(true)
      setMessage("")

      await api.post(`/social/block/${profile.id}`, {
        reason: "Blocked from public profile page",
      })

      router.push("/dashboard")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL BLOCK PLAYER.")
    } finally {
      setActionLoading(false)
    }
  }

  function handleInviteParty() {
    setMessage("// FITUR INVITE PARTY AKAN DISAMBUNGKAN KE PARTY ROOM NANTI.")
  }

  useEffect(() => {
    loadProfile()
  }, [identifier])

 if (loading) {
  return (
    <ProtectedRoute>
      <MabarLoading text="LOADING PROFILE" />
    </ProtectedRoute>
  )
}

  if (!profile) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
          <Sidebar />

          <section className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h1 className="text-2xl font-black uppercase tracking-tight text-red-500">
                ⚠️ PROFILE TIDAK DITEMUKAN
              </h1>

              <p className="mt-4 text-xs font-bold uppercase leading-relaxed text-zinc-500">
                Player ini tidak tersedia, berganti username, atau sudah dihapus dari sistem database.
              </p>

              <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 flex h-12 w-full items-center justify-center border-2 border-black bg-white text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-zinc-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                KEMBALI KE DASHBOARD
              </button>
            </div>
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  const avatarBorder = profile.equipped_avatar_border
  const avatarBorderUrl = avatarBorder?.image_url || null
  const equippedBadges = profile.equipped_badges || []
  const role = profile.role || "user"
  const displayName = profile.display_name || profile.username

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto">
          <div className="relative h-[260px] border-b-4 border-black bg-zinc-900">
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Profile Banner"
                className="h-full w-full object-cover opacity-40 grayscale"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#0E1318] text-xs font-black uppercase tracking-widest text-zinc-700">
                [ NO CUSTOM BANNER DEPLOYED ]
              </div>
            )}

            <div className="absolute inset-0 bg-black/30" />
          </div>

          <div className="relative px-6 pb-16 lg:px-10">
            <div className="-mt-20 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="relative h-40 w-40 shrink-0">
  <div
    className={`absolute inset-[10px] overflow-hidden border-4 bg-[#191B1F] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
      role === "admin"
        ? "border-yellow-400 shadow-[0_0_28px_rgba(250,204,21,0.45)]"
        : role === "pro_player"
          ? "border-[#53FC18] shadow-[0_0_28px_rgba(83,252,24,0.35)]"
          : "border-black"
    }`}
  >
    {profile.avatar_url ? (
      <img
        src={profile.avatar_url}
        alt={profile.username}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-5xl font-black text-zinc-600">
        {profile.username.charAt(0).toUpperCase()}
      </div>
    )}
  </div>

  {avatarBorderUrl && (
    <img
      src={avatarBorderUrl}
      alt={avatarBorder?.name || "Avatar Border"}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full object-contain"
    />
  )}

  <div
    className={`absolute bottom-2 right-2 z-30 border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase tracking-tight ${
      profile.online_status
        ? "bg-[#53FC18] text-black"
        : "bg-zinc-500 text-white"
    }`}
  >
    {profile.online_status ? "LIVE" : "OFF"}
  </div>

  {role !== "user" && (
    <div
      className={`absolute -top-3 left-1/2 z-30 -translate-x-1/2 border-2 px-2 py-1 text-[9px] font-black uppercase tracking-widest ${getRoleStyle(role)}`}
    >
      {role === "admin" ? "ADMIN" : "PRO"}
    </div>
  )}
</div>

                <div className="flex-1">
                  <div
                    className={`mb-3 inline-flex border border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                      profile.online_status
                        ? "bg-[#53FC18]/10 text-[#53FC18]"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    //{" "}
                    {profile.online_status
                      ? "ONLINE NOW"
                      : profile.last_online_text?.toUpperCase() || "OFFLINE"}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                      {displayName}
                    </h1>

                    <span
                      className={`border-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getRoleStyle(role)}`}
                    >
                      {role}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-bold uppercase text-[#53FC18]">
                    @{profile.username}
                  </p>

                  <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-400">
                    {profile.bio || "PLAYER INI BELUM MENULIS BIO SPESIFIKASI."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Tag color="green">{profile.game_rank || "UNRANKED"}</Tag>
                    <Tag>{profile.preferred_role || "NO PREFERRED ROLE"}</Tag>
                    <Tag>{profile.favorite_game || "NO FAVORITE GAME"}</Tag>
                    <Tag>{profile.region || "GLOBAL REGION"}</Tag>
                  </div>

                  {equippedBadges.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {equippedBadges.map((badge) => (
                        <ProfileBadge key={badge.id || badge.name} badge={badge} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!profile.is_own_profile && (
                <div className="flex flex-wrap gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={handleFollow}
                    className={`flex h-12 items-center justify-center border-2 border-black px-6 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-40 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      isFollowing
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-[#53FC18] text-black hover:bg-[#6eff3b]"
                    }`}
                  >
                    {actionLoading
                      ? "LOADING..."
                      : isFollowing
                        ? "UNFOLLOW"
                        : "FOLLOW PLAYER"}
                  </button>

                  <button
                    onClick={handleInviteParty}
                    className="flex h-12 items-center justify-center border-2 border-black bg-[#191B1F] px-6 text-xs font-black uppercase tracking-widest text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    INVITE PARTY
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={handleBlock}
                    className="flex h-12 items-center justify-center border-2 border-black bg-red-950/40 px-6 text-xs font-black uppercase tracking-widest text-red-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-900/40 disabled:opacity-40 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  >
                    BLOCK
                  </button>
                </div>
              )}
            </div>

            {message && (
              <div className="mt-10 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                {message}
              </div>
            )}

            <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="FOLLOWERS" value={profile.followers_count || 0} />
              <Stat label="FOLLOWING" value={profile.following_count || 0} />
              <Stat
                label="AVG RATING"
                value={`★ ${Number(profile.average_rating || 0).toFixed(1)}`}
                isHighlight
              />
              <Stat label="TOTAL REVIEWS" value={profile.total_ratings || 0} />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  // EQUIPPED COSMETICS
                </h2>

                <div className="mt-6 space-y-5">
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Avatar Border
                    </p>

                    {avatarBorder ? (
                      <div className="flex items-center gap-3 border-2 border-black bg-[#191B1F] p-3">
                        {avatarBorder.image_url && (
                          <img
                            src={avatarBorder.image_url}
                            alt={avatarBorder.name || "Border"}
                            className="h-12 w-12 object-contain"
                          />
                        )}
                        <div>
                          <p className="text-xs font-black uppercase text-white">
                            {avatarBorder.name || "Avatar Border"}
                          </p>
                          <p className="text-[9px] font-black uppercase text-[#53FC18]">
                            {avatarBorder.rarity || "cosmetic"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold uppercase text-zinc-600">
                        BELUM ADA AVATAR BORDER DIPAKAI.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      Badges
                    </p>

                    {equippedBadges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {equippedBadges.map((badge) => (
                          <ProfileBadge key={badge.id || badge.name} badge={badge} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-bold uppercase text-zinc-600">
                        BELUM ADA BADGE DIPAKAI.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xl:col-span-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  // PLAYER PROFILE ATTRIBUTES
                </h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Info label="ACCOUNT ROLE" value={role} />
                  <Info label="FAVORITE GAME" value={profile.favorite_game} />
                  <Info label="COMPETITIVE RANK" value={profile.game_rank} />
                  <Info label="PREFERRED ROLE" value={profile.preferred_role} />
                  <Info label="SERVER REGION" value={profile.region} />
                  <Info label="GENDER IDENTIFICATION" value={profile.gender} />
                  <Info label="LAST SESSION LOG" value={profile.last_online_text} />
                </div>
              </div>

              <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] xl:col-span-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">
                  // SYSTEM RECENT ACTIVITY LOGS
                </h2>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Activity
                    title="PARTY HISTORY"
                    value="BELUM ADA REKAM DATA JEJAK PARTY."
                  />
                  <Activity
                    title="RATINGS RECEIVED"
                    value="BELUM ADA REVIEW ATAU KOMENTAR MASUK."
                  />
                  <Activity
                    title="RECENT ARENA MATCH"
                    value="TIDAK ADA AKTIVITAS KOMPETISI TERBARU."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function ProfileBadge({ badge }: { badge: ShopItem }) {
  const metadata = parseMetadata(badge.metadata)
  const label = metadata.label || badge.name || "BADGE"
  const color = metadata.color
  const animated = metadata.animation === "pulse" || metadata.glow

  return (
    <div className="flex items-center gap-2 border-2 border-black bg-[#191B1F] px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {badge.image_url && (
        <img
          src={badge.image_url}
          alt={badge.name || label}
          className={`h-7 w-7 object-contain ${animated ? "animate-pulse" : ""}`}
        />
      )}

      <span
        className={`border-2 border-black px-2 py-1 text-[9px] font-black uppercase tracking-widest ${getBadgeColor(color)} ${
          animated ? "animate-pulse" : ""
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function Tag({
  children,
  color,
}: {
  children: React.ReactNode
  color?: "green"
}) {
  return (
    <div
      className={`border border-black px-3 py-1 text-[11px] font-black uppercase tracking-wide ${
        color === "green"
          ? "bg-[#53FC18] text-black"
          : "bg-[#191B1F] text-zinc-400"
      }`}
    >
      {children}
    </div>
  )
}

function Stat({
  label,
  value,
  isHighlight = false,
}: {
  label: string
  value: string | number
  isHighlight?: boolean
}) {
  return (
    <div
      className={`border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
        isHighlight ? "bg-[#1d3511] text-[#53FC18]" : "bg-[#0E1318] text-white"
      }`}
    >
      <h2 className="text-4xl font-black uppercase tracking-tighter">{value}</h2>
      <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="border-2 border-black bg-[#191B1F] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-black uppercase tracking-tight text-white">
        {value || "[ NOT SPECIFIED ]"}
      </p>
    </div>
  )
}

function Activity({ title, value }: { title: string; value: string }) {
  return (
    <div className="border-2 border-black bg-[#191B1F] p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xs font-black uppercase tracking-wider text-[#53FC18]">
        // {title}
      </h3>
      <p className="mt-3 text-[11px] font-bold uppercase leading-relaxed text-zinc-500">
        {value}
      </p>
    </div>
  )
}