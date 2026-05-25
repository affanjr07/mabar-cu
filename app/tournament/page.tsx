"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
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
  is_registered?: boolean // Antisipasi jika backend mengirimkan status partisipasi
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

  // Tracker state internal untuk mengunci turnamen yang sudah didaftar pada sesi ini
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<string[]>([])

  // State pendaftaran tim inline
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

      setTournaments(tournamentData)
      setGames(gameData)

      // Sinkronisasi jika dari backend ada field penanda user sudah gabung
      const preRegistered = tournamentData
        .filter((t: Tournament) => t.is_registered)
        .map((t: Tournament) => t.id)
      if (preRegistered.length > 0) {
        setRegisteredTournamentIds((prev) => Array.from(new Set([...prev, ...preRegistered])))
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

    // Validasi double-check di sisi client
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

      // Masukkan ID tournament ke dalam daftar terkunci
      setRegisteredTournamentIds((prev) => [...prev, tournamentId])

      setIsErrorAlert(false)
      setMessage(`⚡ BERHASIL DAFTAR TOURNAMENT DENGAN SQUAD: "${teamNameInput.toUpperCase()}". SIAPKAN SQUADMU!`)
      
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

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* BRUTALIST JUMBOTRON HEADER */}
          <div className="relative border-b-4 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:p-10">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-4 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
                // LIVE TOURNAMENT ARENA
              </div>

              <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                Esports Tournament
              </h1>

              <p className="mt-4 text-xs font-bold uppercase leading-relaxed text-zinc-500">
                Daftar tournament, bentuk squad brutalmu, habisi lawan di arena, dan klaim total prize pool tunai.
              </p>
            </div>
          </div>

          {/* ALERT SYSTEM */}
          {message && (
            <div className={`mt-8 border-2 border-black p-4 text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              isErrorAlert 
                ? "bg-red-950/40 text-red-500 border-red-500/50" 
                : "bg-[#142A14] text-[#53FC18] border-[#53FC18]/50"
            }`}>
              {isErrorAlert ? `⚠️ ANDA SUDAH MENDAFTAR DI TOURNAMENT INI!` : message}
            </div>
          )}

          {/* FILTER ACTION BAR */}
          <div className="mt-10 grid gap-4 bg-[#0E1318] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:grid-cols-3">
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
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
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
            >
              <option value="upcoming">UPCOMING</option>
              <option value="ongoing">ONGOING</option>
              <option value="finished">FINISHED</option>
              <option value="">ALL STATUS</option>
            </select>

            <button
              onClick={loadData}
              className="flex h-14 items-center justify-center border-2 border-black bg-[#191B1F] text-xs font-black uppercase tracking-wider text-[#53FC18] transition-all hover:bg-black active:bg-neutral-900"
            >
              SEARCH TOURNAMENT
            </button>
          </div>

          {/* TOURNAMENT CARDS LIST */}
          <div className="mt-12 grid gap-8 xl:grid-cols-2">
            {loading ? (
              <div className="border-2 border-black bg-[#0E1318] p-8 text-xs font-bold uppercase tracking-wider text-zinc-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-full">
                ⏳ LOADING TOURNAMENT DATA...
              </div>
            ) : tournaments.length === 0 ? (
              <div className="border-2 border-black bg-[#0E1318] p-8 text-xs font-bold uppercase tracking-wider text-zinc-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] col-span-full">
                ⚠️ BELUM ADA TOURNAMENT YANG TERSEDIA.
              </div>
            ) : (
              tournaments.map((tour) => {
                const isUserRegistered = registeredTournamentIds.includes(tour.id)

                return (
                  <div
                    key={tour.id}
                    className="group flex flex-col border-2 border-black bg-[#0E1318] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {/* HERO BANNER SECTION */}
                    <div className="relative h-48 border-b-2 border-black bg-neutral-900">
                      {tour.banner_url ? (
                        <img
                          src={tour.banner_url}
                          alt={tour.title}
                          className="h-full w-full object-cover opacity-60 grayscale filter transition duration-300 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#21262d] to-[#0e1318] text-xs font-black text-zinc-700 uppercase tracking-widest">
                          [ NO BANNER IMAGE AVAILABLE ]
                        </div>
                      )}
                      
                      {/* REALTIME COUNTDOWN IN BOLD BADGE */}
                      <div className="absolute bottom-4 left-4 border-2 border-black bg-black p-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">
                        <CountdownTimer targetDate={tour.date} status={tour.status} />
                      </div>
                    </div>

                    {/* DETAILS CARD */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <span className="border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#53FC18]">
                          // {tour.games?.name || "UNKNOWN GAME"}
                        </span>

                        <span className="border border-black bg-zinc-800 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          STATUS: {tour.status}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black uppercase tracking-tight line-clamp-1">
                        {tour.title}
                      </h2>

                      <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-zinc-500 line-clamp-2">
                        {tour.description || "TIDAK ADA DESKRIPSI UNTUK TURNAMEN INI."}
                      </p>

                      {/* METRICS INFO */}
                      <div className="mt-6 grid gap-2 sm:grid-cols-3">
                        <Info label="PRIZE POOL" value={tour.prize || "NO PRIZE"} isHighlight={true} />
                        <Info
                          label="SLOTS FILLED"
                          value={`${tour.registration_count} / ${tour.max_players || "∞"}`}
                        />
                        <Info
                          label="START DATE"
                          value={new Date(tour.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        />
                      </div>

                      {/* INTERACTIVE INLINE REGISTRATION FORM FIELD */}
                      <div className="mt-6 min-h-[48px]">
                        {tour.status.toLowerCase() === "finished" ? (
                          <div className="flex h-12 w-full items-center justify-center border-2 border-black bg-zinc-800 text-xs font-black uppercase tracking-widest text-zinc-500 opacity-50">
                            REGISTRATION CLOSED
                          </div>
                        ) : tour.status.toLowerCase() === "ongoing" ? (
                          <div className="flex h-12 w-full items-center justify-center border-2 border-black bg-red-950/20 text-xs font-black uppercase tracking-widest text-red-500 border-red-900/50">
                            TOURNAMENT ONGOING
                          </div>
                        ) : isUserRegistered ? (
                          // Kondisi Jika User Sudah Terdaftar
                          <div className="flex h-12 w-full items-center justify-center border-2 border-zinc-700 bg-zinc-900/50 text-xs font-black uppercase tracking-widest text-zinc-500">
                            ✓ ALREADY REGISTERED
                          </div>
                        ) : activeRegisterId === tour.id ? (
                          // Form Pengetikan Nama Tim
                          <div className="flex flex-col gap-2 border-2 border-black bg-[#191B1F] p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:flex-row">
                            <input
                              type="text"
                              value={teamNameInput}
                              onChange={(e) => setTeamNameInput(e.target.value)}
                              placeholder="INPUT SQUAD / TEAM NAME..."
                              className="h-10 flex-1 bg-transparent px-3 text-xs font-bold uppercase tracking-wider text-white outline-none placeholder-zinc-600"
                              autoFocus
                              disabled={submittingId === tour.id}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => submitRegistration(tour.id)}
                                disabled={!teamNameInput.trim() || submittingId === tour.id}
                                className="h-10 border-2 border-black bg-[#53FC18] px-4 text-xs font-black uppercase text-black hover:bg-[#6eff3b] disabled:opacity-30 active:translate-y-[1px]"
                              >
                                {submittingId === tour.id ? "JOINING..." : "CONFIRM"}
                              </button>
                              <button
                                onClick={() => {
                                  setActiveRegisterId(null)
                                  setTeamNameInput("")
                                }}
                                disabled={submittingId === tour.id}
                                className="h-10 border-2 border-black bg-zinc-800 px-4 text-xs font-black uppercase text-zinc-400 hover:bg-zinc-700 active:translate-y-[1px]"
                              >
                                CANCEL
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Tombol Trigger Utama
                          <button
                            onClick={() => {
                              setActiveRegisterId(tour.id)
                              setTeamNameInput("")
                            }}
                            className="flex h-12 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
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

/* METRIC COMPONENT WITH BRUTALIST BOX */
function Info({
  label,
  value,
  isHighlight = false,
}: {
  label: string
  value: string | number
  isHighlight?: boolean
}) {
  return (
    <div className={`border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
      isHighlight ? "bg-[#1d3511] text-[#53FC18]" : "bg-[#191B1F] text-white"
    }`}>
      <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-0.5 text-xs font-black uppercase tracking-tight truncate">{value}</p>
    </div>
  )
}

/* DYNAMIC REAL-TIME COUNTDOWN COMPONENT */
function CountdownTimer({ targetDate, status }: { targetDate: string; status: string }) {
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
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      let countdownStr = ""
      if (days > 0) countdownStr += `${days}D `
      countdownStr += `${hours.toString().padStart(2, "0")}H:${minutes.toString().padStart(2, "0")}M:${seconds.toString().padStart(2, "0")}S`
      
      setTimeLeft(countdownStr)
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, status])

  return (
    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
      <span className={`h-2 w-2 animate-ping ${status.toLowerCase() === 'upcoming' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
      <span className={status.toLowerCase() === 'upcoming' ? 'text-yellow-400' : 'text-red-500'}>
        {status.toLowerCase() === 'upcoming' ? `REG CLOSING: ${timeLeft}` : timeLeft}
      </span>
    </div>
  )
}