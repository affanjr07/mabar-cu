"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import GamerCard from "@/components/profile/GamerCard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AnnouncementBanner from "@/components/announcement/AnnouncementBanner"
import {
  getOnlinePlayers,
  getTournaments,
  searchPlayers,
} from "@/services/dashboard.service"
import { useAuthStore } from "@/store/auth.store"
import {
  Search,
  LogOut,
  Swords,
  Flame,
  Trophy,
  HelpCircle,
  ShieldAlert,
} from "lucide-react"

interface Player {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  favorite_game?: string
  game_rank?: string
  preferred_role?: string
  region?: string
  online_status: boolean
  last_online?: string
  last_online_text?: string
  average_rating?: number
  role?: "user" | "admin" | "pro_player"
  equipped_avatar_border?: any
}

interface Tournament {
  id: string
  title: string
  prize: string
  date: string
  registration_count: number
}

export default function DashboardPage() {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const [players, setPlayers] = useState<Player[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [playersOffset, setPlayersOffset] = useState(0)
  const [hasMorePlayers, setHasMorePlayers] = useState(true)

  const playerLimit = 15

  function sortPlayersByStatus(data: Player[]) {
    return [...data].sort((a, b) => {
      if (a.online_status === b.online_status) return 0
      return a.online_status ? -1 : 1
    })
  }

  async function loadPlayers(reset = false) {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const nextOffset = reset ? 0 : playersOffset

      let data: Player[] = []

      try {
        data = await searchPlayers("", playerLimit, nextOffset)
      } catch {
        data = await getOnlinePlayers(playerLimit, nextOffset)
      }

      const sortedData = sortPlayersByStatus(data || [])

      if (reset) {
        setPlayers(sortedData)
        setPlayersOffset(playerLimit)
      } else {
        setPlayers((prev) => sortPlayersByStatus([...prev, ...sortedData]))
        setPlayersOffset((prev) => prev + playerLimit)
      }

      setHasMorePlayers((data || []).length === playerLimit)
    } catch (error) {
      console.log("Players error:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function loadDashboard() {
    try {
      setLoading(true)

      const tournamentsData = await getTournaments()
      setTournaments(tournamentsData || [])

      await loadPlayers(true)
    } catch (error) {
      console.log("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(value: string) {
    setSearch(value)

    try {
      setLoading(true)

      const data = await searchPlayers(value, playerLimit, 0)
      const sortedData = sortPlayersByStatus(data || [])

      setPlayers(sortedData)
      setPlayersOffset(playerLimit)
      setHasMorePlayers((data || []).length === playerLimit)
    } catch (error) {
      console.log("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadMore() {
    try {
      setLoadingMore(true)

      const data = await searchPlayers(search, playerLimit, playersOffset)
      const sortedData = sortPlayersByStatus(data || [])

      setPlayers((prev) => sortPlayersByStatus([...prev, ...sortedData]))
      setPlayersOffset((prev) => prev + playerLimit)
      setHasMorePlayers((data || []).length === playerLimit)
    } catch (error) {
      console.log("Load more error:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  function handleLogout() {
    logout()
    localStorage.removeItem("mabar_token")
    router.push("/login")
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const featuredTournament = tournaments[0]
  const onlinePlayersCount = players.filter((player) => player.online_status).length

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black">
        <Sidebar />

        <section className="custom-scrollbar flex flex-1 flex-col justify-between overflow-y-auto">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-6 border-b-2 border-[#191B1F] pb-6 lg:flex-row lg:items-center">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
                  Welcome Back, <span className="text-[#53FC18]">Gamer</span>
                </h1>

                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Temukan squad terbaik & bantai musuhmu hari ini.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex w-full items-center border-2 border-[#191B1F] bg-[#0E1318] px-4 transition-colors focus-within:border-[#53FC18] sm:w-80">
                  <Search size={18} className="mr-2 shrink-0 text-zinc-500" />

                  <input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="CARI PLAYER..."
                    className="h-12 w-full bg-transparent text-sm font-bold uppercase tracking-tight text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-12 items-center gap-2 border-2 border-black bg-red-600 px-5 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-6">
              <AnnouncementBanner />
            </div>

            <div className="mt-6 overflow-hidden border-2 border-black bg-[#191B1F] py-2 text-xs font-black uppercase tracking-widest text-[#53FC18]">
              <div className="marquee-track gap-8 whitespace-nowrap">
                <span>
                  🔥 UPDATE TOURNAMENT TERBARU SEDANG BERLANGSUNG • SEGERA DAFTARKAN TIM MU SEBELUM SLOT HABIS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW
                </span>
                <span>
                  🔥 UPDATE TOURNAMENT TERBARU SEDANG BERLANGSUNG • SEGERA DAFTARKAN TIM MU SEBELUM SLOT HABIS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW
                </span>
                <span>
                  🔥 UPDATE TOURNAMENT TERBARU SEDANG BERLANGSUNG • SEGERA DAFTARKAN TIM MU SEBELUM SLOT HABIS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="group relative overflow-hidden border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:p-8 lg:col-span-2">
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#53FC18]/10 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-4 inline-flex border border-black bg-[#53FC18] px-3 py-1 text-xs font-black text-black">
                      EVENT TERBARU
                    </div>

                    <h2 className="text-3xl font-black uppercase leading-none tracking-tighter sm:text-5xl">
                      {featuredTournament
                        ? featuredTournament.title
                        : "JOIN TOURNAMENT"}
                      <br />
                      <span className="text-[#53FC18]">SEASON 2026</span>
                    </h2>

                    <p className="mt-4 max-w-md text-xs font-bold uppercase tracking-tight text-zinc-400">
                      {featuredTournament
                        ? `Total Hadiah: ${featuredTournament.prize} • Ikuti kompetisi sengit antarsquad!`
                        : "Menangkan prize pool bersama squad terbaikmu. Tunjukkan taringmu di arena kompetitif."}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/tournament")}
                    className="mt-8 self-start border-2 border-black bg-[#53FC18] px-6 py-3 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Join Now
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-between border-2 border-black border-l-[#53FC18] bg-[#191B1F] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#53FC18]">
                    <Swords size={16} />
                    PROMOTION BLOCK
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight text-white">
                    UPGRADE KE <span className="text-[#53FC18]">PRO MEMBER</span>
                  </h3>

                  <p className="mt-2 text-xs font-bold uppercase leading-relaxed tracking-tight text-zinc-400">
                    Dapatkan badge eksklusif, akses prioritas matchmaking, dan fitur booking VIP.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/pro")}
                  className="mt-6 block border-2 border-[#53FC18] bg-transparent py-2.5 text-center text-xs font-black uppercase tracking-wider text-[#53FC18] transition-colors hover:bg-[#53FC18] hover:text-black"
                >
                  Pelajari Selengkapnya
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                value={players.length}
                label="Loaded Players"
                icon={<Flame size={20} className="text-zinc-600" />}
              />

              <StatCard
                value={onlinePlayersCount}
                label="Online Players"
                icon={<Flame size={20} className="text-zinc-600" />}
              />

              <StatCard
                value={tournaments.length}
                label="Upcoming Events"
                icon={<Trophy size={20} className="text-zinc-600" />}
              />

              <StatCard
                value="5v5"
                label="Party Mode"
                icon={<Swords size={20} className="text-zinc-600" />}
              />
            </div>

            <div className="mt-14">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#191B1F] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">
                    Lobby Players
                  </h2>

                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Semua player ditampilkan, online di atas dan offline tetap terlihat.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/matchmaking")}
                  className="self-start border-2 border-[#53FC18] bg-[#53FC18]/5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#53FC18] transition-colors hover:bg-[#53FC18] hover:text-black"
                >
                  Auto Matchmaking
                </button>
              </div>

              {loading ? (
                <div className="border-2 border-dashed border-[#191B1F] bg-[#0E1318] p-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Mencari data player di server...
                </div>
              ) : players.length === 0 ? (
                <div className="border-2 border-dashed border-[#191B1F] bg-[#0E1318] p-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <ShieldAlert className="mx-auto mb-2 text-zinc-600" size={24} />
                  Belum ada player dalam jangkauan radar.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`transition-transform duration-150 hover:translate-y-[-2px] ${
                          player.online_status ? "" : "opacity-70 grayscale"
                        }`}
                      >
                        <GamerCard
                          id={player.id}
                          username={player.display_name || player.username}
                          role={player.preferred_role || "Unknown Role"}
                          rank={player.game_rank || "Unranked"}
                          online={Boolean(player.online_status)}
                          avatar={player.avatar_url}
                          avatarBorder={player.equipped_avatar_border}
                          game={player.favorite_game}
                          region={player.region}
                          rating={player.average_rating}
                          pro={player.role === "pro_player"}
                          lastOnlineText={
                            player.online_status
                              ? "Online sekarang"
                              : player.last_online_text || "Offline"
                          }
                          onViewProfile={() => router.push(`/users/${player.id}`)}
                        />
                      </div>
                    ))}
                  </div>

                  {hasMorePlayers && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="mt-8 w-full border-2 border-black bg-[#191B1F] py-4 text-xs font-black uppercase tracking-widest text-[#53FC18] hover:bg-black disabled:opacity-50"
                    >
                      {loadingMore ? "Loading More..." : "Load More Players"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <footer className="mt-16 border-t-2 border-[#191B1F] bg-[#0E1318] p-6 font-mono text-xs text-zinc-500">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="border border-zinc-700 bg-black px-2 py-0.5 font-black text-white">
                  M
                </span>

                <p className="font-bold uppercase tracking-tight">
                  © 2026 MABAR.CU • ALL RIGHTS RESERVED.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 font-bold uppercase tracking-wider">
                <a
                  href="#"
                  className="flex items-center gap-1 transition-colors hover:text-[#53FC18]"
                >
                  <HelpCircle size={14} /> Support
                </a>

                <a href="#" className="transition-colors hover:text-[#53FC18]">
                  Terms of Service
                </a>

                <a href="#" className="transition-colors hover:text-[#53FC18]">
                  Privacy Policy
                </a>
              </div>
            </div>
          </footer>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: string | number
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px]">
      <div className="flex items-start justify-between">
        <h2 className="text-4xl font-black tracking-tight text-[#53FC18]">
          {value}
        </h2>

        {icon}
      </div>

      <p className="mt-1 text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  )
}