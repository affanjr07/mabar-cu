"use client"

import { useEffect, useState, memo } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MabarLoading from "@/components/ui/MabarLoading"
import { getGames } from "@/services/game.service"
import {
  getTournaments,
  registerTournament,
} from "@/services/tournament.service"

interface Game {
  id: string
  name: string
}

interface Tournament {
  id: string
  title: string
  description?: string
  banner_url?: string
  date: string
  prize?: string
  max_players?: number
  status: string
  registration_count: number
  is_registered?: boolean
  games?: {
    id: string
    name: string
    genre: string
  }
}

export default function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState("")
  const [status, setStatus] = useState("upcoming")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [isErrorAlert, setIsErrorAlert] = useState(false)

  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<string[]>([])
  const [activeRegisterId, setActiveRegisterId] = useState<string | null>(null)
  const [teamNameInput, setTeamNameInput] = useState("")
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  async function loadData() {
    try {
      setLoading(true)
      const [tournamentData, gameData] = await Promise.all([
        getTournaments({
          status: status || undefined,
          gameId: selectedGameId || undefined,
        }),
        getGames(),
      ])

      setTournaments(tournamentData || [])
      setGames(gameData || [])

      const preRegistered = (tournamentData || [])
        .filter((t: Tournament) => t.is_registered)
        .map((t: Tournament) => t.id)

      if (preRegistered.length > 0) {
        setRegisteredTournamentIds((prev) =>
          Array.from(new Set([...prev, ...preRegistered]))
        )
      }
    } catch (error: any) {
      setIsErrorAlert(true)
      setMessage(error.response?.data?.message || "GAGAL MENGAMBIL TOURNAMENT")
    } finally {
      setLoading(false)
    }
  }

  async function submitRegistration(tournamentId: string) {
    if (!teamNameInput.trim()) return

    if (registeredTournamentIds.includes(tournamentId)) {
      setIsErrorAlert(true)
      setMessage("⚠️ ACCESS_DENIED: ANDA SUDAH TERDAFTAR DI TOURNAMENT INI!")
      setActiveRegisterId(null)
      setTeamNameInput("")
      return
    }

    try {
      setSubmittingId(tournamentId)
      setIsErrorAlert(false)
      setMessage("")

      await registerTournament(tournamentId, teamNameInput)

      setRegisteredTournamentIds((prev) => [...prev, tournamentId])
      setIsErrorAlert(false)
      setMessage(
        `⚡ BERHASIL DAFTAR TOURNAMENT DENGAN SQUAD: "${teamNameInput.toUpperCase()}". SIAPKAN SQUADMU!`
      )

      setActiveRegisterId(null)
      setTeamNameInput("")

      await loadData()
    } catch (error: any) {
      setIsErrorAlert(true)
      setMessage(error.response?.data?.message || "GAGAL DAFTAR TOURNAMENT")
    } finally {
      setSubmittingId(null)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const isInitialLoading = loading && tournaments.length === 0 && games.length === 0

if (isInitialLoading) {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <MabarLoading mode="section" />
        </section>
      </main>
    </ProtectedRoute>
  )
}

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black">
        <Sidebar />

        <section className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="relative overflow-hidden border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:border-b-4 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/3 bg-gradient-to-l from-[#53FC18]/5 to-transparent sm:block" />

            <div className="relative z-10 max-w-2xl">
              <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#53FC18] sm:px-3 sm:py-1 sm:text-xs">
                // LIVE TOURNAMENT ARENA
              </div>

              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
                Esports Tournament
              </h1>

              <p className="mt-2 text-[11px] font-bold uppercase leading-relaxed text-zinc-500 sm:mt-4 sm:text-xs">
                Daftar tournament, bentuk squad brutalmu, habisi lawan di arena,
                dan klaim total prize pool tunai.
              </p>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 border-2 border-black p-3 text-[11px] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:mt-6 sm:p-4 sm:text-xs ${
                isErrorAlert
                  ? "border-red-500/50 bg-red-950/40 text-red-500"
                  : "border-[#53FC18]/50 bg-[#142A14] text-[#53FC18]"
              }`}
            >
              {isErrorAlert ? "⚠️ ANDA SUDAH MENDAFTAR DI TOURNAMENT INI!" : message}
            </div>
          )}

          <div className="mt-6 grid gap-2.5 border-2 border-black bg-[#0E1318] p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:mt-8 sm:p-4 md:grid-cols-3">
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="h-11 border-2 border-black bg-[#191B1F] px-3 text-[11px] font-bold uppercase text-white outline-none focus:border-[#53FC18] sm:h-14 sm:text-xs"
            >
              <option value="">ALL GAMES</option>
              {games.map((game) => (
                <option key={game.id} value={game.id} className="bg-[#191B1F]">
                  {game.name.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 border-2 border-black bg-[#191B1F] px-3 text-[11px] font-bold uppercase text-white outline-none focus:border-[#53FC18] sm:h-14 sm:text-xs"
            >
              <option value="upcoming">UPCOMING</option>
              <option value="ongoing">ONGOING</option>
              <option value="finished">FINISHED</option>
              <option value="">ALL STATUS</option>
            </select>

            <button
              onClick={loadData}
              className="flex h-11 items-center justify-center border-2 border-black bg-[#191B1F] text-[11px] font-black uppercase tracking-wider text-[#53FC18] transition-all hover:bg-black active:scale-[0.99] sm:h-14 sm:text-xs"
            >
              SEARCH TOURNAMENT
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:gap-6 xl:grid-cols-2">
            {loading ? (
              <div className="col-span-full border-2 border-black bg-[#0E1318] p-6 text-[11px] font-bold uppercase tracking-wider text-zinc-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:text-xs">
                ⏳ LOADING TOURNAMENT DATA...
              </div>
            ) : tournaments.length === 0 ? (
              <div className="col-span-full border-2 border-black bg-[#0E1318] p-6 text-[11px] font-bold uppercase tracking-wider text-zinc-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:text-xs">
                ⚠️ BELUM ADA TOURNAMENT YANG TERSEDIA.
              </div>
            ) : (
              tournaments.map((tour) => {
                const isUserRegistered = registeredTournamentIds.includes(tour.id)

                return (
                  <div
                    key={tour.id}
                    className="group flex flex-col border-2 border-black bg-[#0E1318] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform duration-150 will-change-transform hover:translate-y-[-2px]"
                  >
                    <div className="relative h-36 overflow-hidden border-b-2 border-black bg-neutral-900 sm:h-48">
                      {tour.banner_url ? (
                        <img
                          src={tour.banner_url}
                          alt={tour.title}
                          loading="lazy"
                          className="h-full w-full object-cover opacity-50 grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#21262d] to-[#0e1318] text-[10px] font-black uppercase tracking-widest text-zinc-700">
                          [ NO BANNER AVAILABLE ]
                        </div>
                      )}

                      <div className="absolute bottom-2 left-2 border-2 border-black bg-black p-1.5 sm:bottom-4 sm:left-4 sm:p-2">
                        <CountdownTimer targetDate={tour.date} status={tour.status} />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4 sm:p-6">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="max-w-[120px] truncate border border-black bg-[#53FC18]/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#53FC18] sm:max-w-none sm:text-[10px]">
                          // {tour.games?.name || "UNKNOWN GAME"}
                        </span>

                        <span className="shrink-0 border border-black bg-zinc-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-400 sm:text-[10px]">
                          {tour.status}
                        </span>
                      </div>

                      <h2 className="line-clamp-1 text-lg font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#53FC18] sm:text-2xl">
                        {tour.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-[11px] font-bold uppercase leading-relaxed text-zinc-500 sm:text-xs">
                        {tour.description || "TIDAK ADA DESKRIPSI UNTUK TURNAMEN INI."}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3">
                        <Info label="PRIZE POOL" value={tour.prize || "NO PRIZE"} isHighlight />

                        <Info
                          label="SLOTS FILLED"
                          value={`${tour.registration_count}/${tour.max_players || "∞"}`}
                        />

                        <Info
                          label="START DATE"
                          className="col-span-2 sm:col-span-1"
                          value={new Date(tour.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        />
                      </div>

                      <div className="mt-4 min-h-[44px] sm:mt-6 sm:min-h-[48px]">
                        {tour.status.toLowerCase() === "finished" ? (
                          <div className="flex h-11 w-full items-center justify-center border-2 border-black bg-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-500 opacity-50 sm:h-12 sm:text-xs">
                            REGISTRATION CLOSED
                          </div>
                        ) : tour.status.toLowerCase() === "ongoing" ? (
                          <div className="flex h-11 w-full items-center justify-center border-2 border-red-900/50 bg-red-950/20 text-[11px] font-black uppercase tracking-widest text-red-500 sm:h-12 sm:text-xs">
                            TOURNAMENT ONGOING
                          </div>
                        ) : isUserRegistered ? (
                          <div className="flex h-11 w-full items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 text-[11px] font-black uppercase tracking-widest text-zinc-500 sm:h-12 sm:text-xs">
                            ✓ ALREADY REGISTERED
                          </div>
                        ) : activeRegisterId === tour.id ? (
                          <div className="flex flex-col gap-2 border-2 border-black bg-[#191B1F] p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:flex-row sm:p-2">
                            <input
                              type="text"
                              value={teamNameInput}
                              onChange={(e) => setTeamNameInput(e.target.value)}
                              placeholder="INPUT SQUAD NAME..."
                              className="h-9 flex-1 bg-transparent px-2.5 text-[11px] font-bold uppercase tracking-wider text-white outline-none placeholder:text-zinc-600 sm:h-10 sm:text-xs"
                              autoFocus
                              disabled={submittingId === tour.id}
                            />

                            <div className="flex justify-end gap-1.5 sm:gap-2">
                              <button
                                onClick={() => submitRegistration(tour.id)}
                                disabled={!teamNameInput.trim() || submittingId === tour.id}
                                className="h-9 border-2 border-black bg-[#53FC18] px-3 text-[11px] font-black uppercase text-black hover:bg-[#6eff3b] disabled:opacity-30 sm:h-10 sm:px-4 sm:text-xs"
                              >
                                {submittingId === tour.id ? "JOIN..." : "CONFIRM"}
                              </button>

                              <button
                                onClick={() => {
                                  setActiveRegisterId(null)
                                  setTeamNameInput("")
                                }}
                                disabled={submittingId === tour.id}
                                className="h-9 border-2 border-black bg-zinc-800 px-3 text-[11px] font-black uppercase text-zinc-400 hover:bg-zinc-700 sm:h-10 sm:px-4 sm:text-xs"
                              >
                                CANCEL
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveRegisterId(tour.id)
                              setTeamNameInput("")
                            }}
                            className="flex h-11 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-[11px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:h-12 sm:text-xs sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                          >
                            REGISTER SQUAD NOW
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function Info({
  label,
  value,
  isHighlight = false,
  className = "",
}: {
  label: string
  value: string | number
  isHighlight?: boolean
  className?: string
}) {
  return (
    <div
      className={`border-2 border-black p-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:p-3 sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
        isHighlight ? "bg-[#1d3511] text-[#53FC18]" : "bg-[#191B1F] text-white"
      } ${className}`}
    >
      <p className="text-[8px] font-black uppercase tracking-wider text-zinc-500 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[11px] font-black uppercase tracking-tight sm:text-xs">
        {value}
      </p>
    </div>
  )
}

const CountdownTimer = memo(function CountdownTimer({
  targetDate,
  status,
}: {
  targetDate: string
  status: string
}) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    if (status.toLowerCase() === "finished") {
      setTimeLeft("MATCH FINISHED")
      return
    }

    if (status.toLowerCase() === "ongoing") {
      setTimeLeft("LIVE NOW")
      return
    }

    const targetTime = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetTime - now

      if (difference <= 0) {
        setTimeLeft("TIME UP / STARTING")
        clearInterval(interval)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) / (1000 * 60)
      )
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      let countdownStr = ""
      if (days > 0) countdownStr += `${days}D `
      countdownStr += `${hours.toString().padStart(2, "0")}H:${minutes
        .toString()
        .padStart(2, "0")}M:${seconds.toString().padStart(2, "0")}S`

      setTimeLeft(countdownStr)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, status])

  const isUpcoming = status.toLowerCase() === "upcoming"

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-widest sm:text-[11px]">
      <span
        className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-none sm:h-2 sm:w-2 ${
          isUpcoming ? "bg-yellow-500" : "bg-red-500"
        }`}
      />

      <span className={isUpcoming ? "text-yellow-400" : "text-red-500"}>
        {isUpcoming ? `REG CLOSING: ${timeLeft}` : timeLeft}
      </span>
    </div>
  )
})