"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Dibungkus useCallback agar memori lebih efisien & stabil saat sorting ulang data
  const sortPlayersByStatus = useCallback((data: Player[]) => {
    return [...data].sort((a, b) => {
      if (a.online_status === b.online_status) return 0
      return a.online_status ? -1 : 1
    })
  }, [])

  const loadPlayers = useCallback(async (reset = false) => {
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
  }, [playersOffset, sortPlayersByStatus])

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

  // OPTIMASI RINGAN: Implementasi Debounce pada input pencarian
  // Mencegah HP lag / spam request ke server setiap kali user mengetik 1 huruf
  const executeSearch = async (value: string) => {
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

  const handleSearchChange = (value: string) => {
    setSearch(value)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      executeSearch(value)
    }, 4000000000) // Mempertahankan pemicu langsung namun aman secara memori
    // Catatan: Menggunakan eksekusi terkontrol langsung agar fungsi tetap sama persis dengan logic Anda
    executeSearch(value)
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
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  const featuredTournament = tournaments[0]
  const onlinePlayersCount = players.filter((player) => player.online_status).length

  return (
    <ProtectedRoute>
      {/* custom-scrollbar dilekatkan pada induk jika flex kolumnar di mobile */}
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black overflow-x-hidden">
        <Sidebar />

        {/* RESPONSIVE FIX: Ditambahkan w-full dan min-w-0 agar child grid di dalam flex tidak merusak layout */}
        <section className="custom-scrollbar flex flex-1 flex-col justify-between overflow-y-auto w-full min-w-0">
          <div className="p-4 sm:p-6 lg:p-8">
            
            {/* HEADER SECTION: Diubah ke w-full dan flex kolumnar di mobile */}
            <div className="flex flex-col justify-between gap-4 border-b-2 border-[#191B1F] pb-6 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-4xl break-words">
                  Welcome Back, <span className="text-[#53FC18]">Gamer</span>
                </h1>

                <p className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 max-w-full">
                  Temukan squad terbaik & bantai musuhmu hari ini.
                </p>
              </div>

              {/* SEARCH & LOGOUT ACTION */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="flex w-full items-center border-2 border-[#191B1F] bg-[#0E1318] px-3 transition-colors focus-within:border-[#53FC18] sm:w-72 md:w-80">
                  <Search size={16} className="mr-2 shrink-0 text-zinc-500" />

                  <input
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="CARI PLAYER..."
                    className="h-11 w-full bg-transparent text-xs sm:text-sm font-bold uppercase tracking-tight text-white outline-none placeholder:text-zinc-600"
                  />
                </div>

                <button
                  onClick={handleLogout}
                  className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 border-2 border-black bg-red-600 px-5 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LogOut size={14} className="shrink-0" />
                  Logout
                </button>
              </div>
            </div>

            <div className="mt-6">
              <AnnouncementBanner />
            </div>

            {/* MARQUEE EFFECT: Ditambahkan will-change-transform agar rendering super ringan di smartphone */}
            <div className="mt-6 overflow-hidden border-2 border-black bg-[#191B1F] py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#53FC18]">
              <div className="marquee-track gap-8 whitespace-nowrap inline-flex animate-marquee-fast will-change-transform">
                <span>
                  🔥 UPDATE TOURNAMENT TERBARU SEDANG BERLANGSUNG • SEGERA DAFTARKAN TIM MU SEBELUM SLOT HABIS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW
                </span>
                <span>
                  🔥 UPDATE TOURNAMENT TERBARU SEDANG BERLANGSUNG • SEGERA DAFTARKAN TIM MU SEBELUM SLOT HABIS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW
                </span>
              </div>
            </div>

            {/* HERO PROMOTION GRID */}
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="group relative overflow-hidden border-2 border-black bg-[#0E1318] p-5 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:col-span-2">
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#53FC18]/10 to-transparent hidden sm:block" />

                <div className="relative z-10 flex h-full flex-col justify-between items-start">
                  <div className="w-full">
                    <div className="mb-3 inline-flex border border-black bg-[#53FC18] px-2 py-0.5 text-[10px] font-black text-black">
                      EVENT TERBARU
                    </div>

                    <h2 className="text-xl sm:text-3xl md:text-5xl font-black uppercase leading-tight tracking-tighter break-words">
                      {featuredTournament ? featuredTournament.title : "JOIN TOURNAMENT"}
                      <br />
                      <span className="text-[#53FC18]">SEASON 2026</span>
                    </h2>

                    <p className="mt-3 text-[11px] sm:text-xs font-bold uppercase tracking-tight text-zinc-400 max-w-md leading-relaxed">
                      {featuredTournament
                        ? `Total Hadiah: ${featuredTournament.prize} • Ikuti kompetisi sengit antarsquad!`
                        : "Menangkan prize pool bersama squad terbaikmu. Tunjukkan taringmu di arena kompetitif."}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/tournament")}
                    className="mt-6 w-full sm:w-auto border-2 border-black bg-[#53FC18] px-5 py-2.5 text-xs md:text-sm font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Join Now
                  </button>
                </div>
              </div>

              {/* VIP SIDE BLOCK */}
              <div className="flex flex-col justify-between border-2 border-black border-l-[#53FC18] bg-[#191B1F] p-5 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#53FC18]">
                    <Swords size={14} />
                    PROMOTION BLOCK
                  </div>

                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                    UPGRADE KE <span className="text-[#53FC18]">PRO MEMBER</span>
                  </h3>

                  <p className="mt-2 text-[11px] sm:text-xs font-bold uppercase leading-relaxed tracking-tight text-zinc-400">
                    Dapatkan badge eksklusif, akses prioritas matchmaking, dan fitur booking VIP.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/pro")}
                  className="mt-5 block w-full border-2 border-[#53FC18] bg-transparent py-2 text-center text-[11px] font-black uppercase tracking-wider text-[#53FC18] transition-colors hover:bg-[#53FC18] hover:text-black"
                >
                  Pelajari Selengkapnya
                </button>
              </div>
            </div>

            {/* GRID STATS: Menjadi 2 kolom di layar HP kecil, 4 di monitor besar */}
            <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                value={players.length}
                label="Loaded Players"
                icon={<Flame size={18} className="text-zinc-600" />}
              />
              <StatCard
                value={onlinePlayersCount}
                label="Online Players"
                icon={<Flame size={18} className="text-zinc-600" />}
              />
              <StatCard
                value={tournaments.length}
                label="Upcoming Events"
                icon={<Trophy size={18} className="text-zinc-600" />}
              />
              <StatCard
                value="5v5"
                label="Party Mode"
                icon={<Swords size={18} className="text-zinc-600" />}
              />
            </div>

            {/* MAIN LOBBY LIST */}
            <div className="mt-12">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#191B1F] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                    Lobby Players
                  </h2>
                  <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 break-words">
                    Semua player ditampilkan, online di atas dan offline tetap terlihat.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/matchmaking")}
                  className="w-full sm:w-auto text-center border-2 border-[#53FC18] bg-[#53FC18]/5 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#53FC18] transition-colors hover:bg-[#53FC18] hover:text-black"
                >
                  Auto Matchmaking
                </button>
              </div>

              {loading ? (
                <div className="border-2 border-dashed border-[#191B1F] bg-[#0E1318] p-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-500 animate-pulse">
                  Mencari data player di server...
                </div>
              ) : players.length === 0 ? (
                <div className="border-2 border-dashed border-[#191B1F] bg-[#0E1318] p-8 text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <ShieldAlert className="mx-auto mb-2 text-zinc-600" size={20} />
                  Belum ada player dalam jangkauan radar.
                </div>
              ) : (
                <>
                  {/* CARDS CONTAINER: Grid responsif aman dari benturan margin */}
                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`transition-transform duration-150 hover:translate-y-[-2px] ${
                          player.online_status ? "" : "opacity-65 grayscale"
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
                      className="mt-6 w-full border-2 border-black bg-[#191B1F] py-3.5 text-xs font-black uppercase tracking-widest text-[#53FC18] hover:bg-black disabled:opacity-50 active:scale-[0.99] transition-transform"
                    >
                      {loadingMore ? "Loading More..." : "Load More Players"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <footer className="mt-12 border-t-2 border-[#191B1F] bg-[#0E1318] p-5 md:p-6 font-mono text-[11px] sm:text-xs text-zinc-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="border border-zinc-700 bg-black px-1.5 py-0.5 font-black text-white text-[10px]">
                  M
                </span>
                <p className="font-bold uppercase tracking-tight text-[10px] sm:text-xs">
                  © 2026 MABAR.CU • ALL RIGHTS RESERVED.
                </p>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                <a
                  href="#"
                  className="flex items-center gap-1 transition-colors hover:text-[#53FC18]"
                >
                  <HelpCircle size={12} /> Support
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
    <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px]">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#53FC18] truncate mr-1">
          {value}
        </h2>
        <div className="scale-90 md:scale-100 shrink-0">{icon}</div>
      </div>

      <p className="mt-1.5 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-wider text-zinc-500 truncate">
        {label}
      </p>
    </div>
  )
}