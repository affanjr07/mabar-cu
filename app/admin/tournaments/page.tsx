"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import AdminRoute from "@/components/auth/AdminRoute"
import { getGames } from "@/services/game.service"
import { getTournaments } from "@/services/tournament.service"
import {
  createTournament,
  deleteTournament,
} from "@/services/admin.service"

export default function AdminTournamentsPage() {
  const [games, setGames] = useState<any[]>([])
  const [tournaments, setTournaments] = useState<any[]>([])
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    title: "",
    description: "",
    banner_url: "",
    game_id: "",
    date: "",
    prize: "",
    max_players: 128,
  })

  async function loadData() {
    const [gameData, tournamentData] = await Promise.all([
      getGames(),
      getTournaments({}),
    ])

    setGames(gameData)
    setTournaments(tournamentData)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    try {
      setMessage("")

      await createTournament({
        ...form,
        date: new Date(form.date).toISOString(),
      })

      setMessage("Tournament berhasil dibuat.")

      setForm({
        title: "",
        description: "",
        banner_url: "",
        game_id: "",
        date: "",
        prize: "",
        max_players: 128,
      })

      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat tournament")
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm("Yakin hapus tournament ini?")
    if (!ok) return

    await deleteTournament(id)
    await loadData()
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AdminRoute>
      <main className="flex min-h-screen bg-black text-white">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <h1 className="text-5xl font-black">
            Manage Tournaments
          </h1>

          {message && (
            <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-400">
              {message}
            </div>
          )}

          <form
            onSubmit={handleCreate}
            className="mt-10 rounded-[32px] border border-white/10 bg-[#0d0d0d] p-6"
          >
            <h2 className="text-3xl font-black">
              Create Tournament
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="Title"
                value={form.title}
                onChange={(value) => setForm((p) => ({ ...p, title: value }))}
              />

              <Input
                label="Prize"
                value={form.prize}
                onChange={(value) => setForm((p) => ({ ...p, prize: value }))}
              />

              <Input
                label="Banner URL"
                value={form.banner_url}
                onChange={(value) =>
                  setForm((p) => ({ ...p, banner_url: value }))
                }
              />

              <Input
                label="Date"
                type="datetime-local"
                value={form.date}
                onChange={(value) => setForm((p) => ({ ...p, date: value }))}
              />

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Game
                </label>

                <select
                  value={form.game_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, game_id: e.target.value }))
                  }
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 outline-none"
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id} className="bg-black">
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Max Players"
                type="number"
                value={String(form.max_players)}
                onChange={(value) =>
                  setForm((p) => ({ ...p, max_players: Number(value) }))
                }
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-400">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 outline-none"
                />
              </div>
            </div>

            <button className="glow mt-6 rounded-2xl bg-green-500 px-8 py-4 font-bold text-black">
              Create Tournament
            </button>
          </form>

          <div className="mt-12 grid gap-6 xl:grid-cols-2">
            {tournaments.map((tour) => (
              <div
                key={tour.id}
                className="rounded-[32px] border border-white/10 bg-[#0d0d0d] p-6"
              >
                <h2 className="text-2xl font-black">
                  {tour.title}
                </h2>

                <p className="mt-2 text-zinc-500">
                  {tour.games?.name || "Unknown Game"} • {tour.status}
                </p>

                <p className="mt-4 text-zinc-400">
                  {tour.description}
                </p>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleDelete(tour.id)}
                    className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </AdminRoute>
  )
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-5 outline-none"
      />
    </div>
  )
}