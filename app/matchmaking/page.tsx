"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import PartyCard from "@/components/matchmaking/PartyCard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { getGames } from "@/services/game.service"
import { useAuthStore } from "@/store/auth.store"
import {
  createPartyRoom,
  getPartyRooms,
  joinPartyRoom,
  joinPartyRoomByCode,
  leavePartyRoom,
} from "@/services/matchmaking.service"

interface Game {
  id: string
  name: string
  genre: string
  max_party_size?: number
  roles?: string[]
  ranks?: string[]
}

interface PartyMember {
  id: string
  user_id: string
  role_in_game?: string
  is_owner?: boolean
  is_ready?: boolean
}

interface PartyRoom {
  id: string
  owner_id: string
  title: string
  description?: string
  room_type: string
  room_code?: string
  game_mode?: string
  target_rank?: string
  region?: string
  max_players: number
  status: string
  missing_roles?: string[]
  average_rank?: string
  owner_left_at?: string
  cooldown_until?: string
  party_members?: PartyMember[]
  games?: {
    id: string
    name: string
    genre: string
    roles?: string[]
  }
}

export default function MatchmakingPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [rooms, setRooms] = useState<PartyRoom[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState("")

  const [selectedGameId, setSelectedGameId] = useState("")
  const [role, setRole] = useState("")
  const [rank, setRank] = useState("")
  const [region, setRegion] = useState("")
  const [showCreate, setShowCreate] = useState(false)

  const [roomCode, setRoomCode] = useState("")
  const [joinCodeRole, setJoinCodeRole] = useState("Roamer")

  const selectedGame = games.find((game) => game.id === selectedGameId)

  const defaultRoles = selectedGame?.roles || [
    "EXP Lane",
    "Jungler",
    "Mid Lane",
    "Gold Lane",
    "Roamer",
  ]

  const defaultRanks = selectedGame?.ranks || [
    "Epic",
    "Legend",
    "Mythic",
    "Mythical Glory",
    "Mythic Immortal",
  ]

  const [form, setForm] = useState({
    game_id: "",
    title: "",
    description: "",
    room_type: "public",
    game_mode: "Ranked",
    target_rank: "Mythic",
    region: "Indonesia",
    max_players: 5,
    selected_role: "Jungler",
    required_roles: [
      "EXP Lane",
      "Jungler",
      "Mid Lane",
      "Gold Lane",
      "Roamer",
    ],
  })

  async function loadGames() {
    try {
      const data = await getGames()
      setGames(data)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL MENGAMBIL DATA GAMES")
    }
  }

  async function loadRooms(gameIdParam?: string) {
    try {
      setLoading(true)
      setMessage("")

      const data = await getPartyRooms({
        gameId: gameIdParam ?? (selectedGameId || undefined),
        role: role || undefined,
        rank: rank || undefined,
        region: region || undefined,
      })

      setRooms(data)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL MENGAMBIL ROOM")
    } finally {
      setLoading(false)
    }
  }

  function handleSelectGame(gameId: string) {
    setSelectedGameId(gameId)

    const game = games.find((item) => item.id === gameId)

    if (game) {
      setForm((prev) => ({
        ...prev,
        game_id: game.id,
        max_players: game.max_party_size || 5,
        required_roles: game.roles?.length ? game.roles : prev.required_roles,
        selected_role: game.roles?.[0] || prev.selected_role,
        target_rank: game.ranks?.[0] || prev.target_rank,
      }))
    }

    loadRooms(gameId)
  }

  async function handleCreateParty(e: React.FormEvent) {
    e.preventDefault()

    try {
      setCreating(true)
      setMessage("")

      if (!form.game_id) {
        setMessage("PILIH GAME TERLEBIH DAHULU.")
        return
      }

      if (!form.title.trim()) {
        setMessage("JUDUL PARTY WAJIB DIISI.")
        return
      }

      const result = await createPartyRoom(form)

      setShowCreate(false)

      if (result.room_code) {
        setMessage(`⚡ PRIVATE ROOM DIBUAT! ROOM CODE: ${result.room_code}`)
      } else {
        setMessage("⚡ PARTY ROOM BERHASIL DIBUAT!")
      }

      await loadRooms(form.game_id)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL MEMBUAT PARTY")
    } finally {
      setCreating(false)
    }
  }

async function handleJoin(roomId: string, roomType?: string) {
  try {
    setMessage("")

    if (roomType === "private") {
      setMessage("PRIVATE ROOM WAJIB JOIN LEWAT ROOM CODE DI FORM JOIN CODE.")
      return
    }

    const roleToJoin = prompt("MASUKKAN ROLE KAMU:", role || "Roamer")

    if (!roleToJoin) return

    await joinPartyRoom(roomId, roleToJoin)

    setMessage("⚡ BERHASIL JOIN PARTY.")
    await loadRooms()
  } catch (error: any) {
    console.log("JOIN ERROR:", error.response?.data)
    setMessage(error.response?.data?.message || "GAGAL JOIN PARTY")
  }
}

  async function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault()

    try {
      setMessage("")

      if (!roomCode.trim()) {
        setMessage("ROOM CODE WAJIB DIISI.")
        return
      }

      await joinPartyRoomByCode(roomCode.trim(), joinCodeRole)

      setMessage("⚡ BERHASIL JOIN PRIVATE ROOM.")
      setRoomCode("")
      await loadRooms()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL JOIN PRIVATE ROOM")
    }
  }

  async function handleLeaveRoom(roomId: string) {
    try {
      setMessage("")

      const result = await leavePartyRoom(roomId)

      setMessage(result.message || "BERHASIL KELUAR ROOM")
      await loadRooms()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL KELUAR ROOM")
    }
  }

  function handleOpenRoomChat(roomId: string) {
    router.push(`/rooms/${roomId}/chat`)
  }

  useEffect(() => {
    loadGames()
    loadRooms()
  }, [])

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="flex flex-col justify-between gap-6 border-b-4 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
                // MATCHMAKING SYSTEM
              </div>

              <h1 className="text-4xl font-black uppercase tracking-tight">
                Find Your Squad
              </h1>

              <p className="mt-3 max-w-xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
                Pilih game, cari party berdasarkan role/rank, lalu chat hanya dengan member room.
              </p>
            </div>

            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex h-14 w-full items-center justify-center border-2 border-black bg-[#53FC18] px-8 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] lg:w-auto"
            >
              {showCreate ? "CLOSE FORM" : "[ + CREATE PARTY ]"}
            </button>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {message}
            </div>
          )}

          {showCreate && (
            <form
              onSubmit={handleCreateParty}
              className="mt-10 border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="mb-6 border-b-2 border-black pb-4 text-2xl font-black uppercase tracking-tight text-white">
                // Create Party Room
              </h2>

              <div className="grid gap-5 md:grid-cols-2">
                <SelectBox
                  label="GAME"
                  value={form.game_id}
                  onChange={(gameId) => {
                    const game = games.find((item) => item.id === gameId)

                    setForm((prev) => ({
                      ...prev,
                      game_id: gameId,
                      max_players: game?.max_party_size || 5,
                      required_roles: game?.roles?.length
                        ? game.roles
                        : prev.required_roles,
                      selected_role: game?.roles?.[0] || prev.selected_role,
                      target_rank: game?.ranks?.[0] || prev.target_rank,
                    }))
                  }}
                  options={[
                    { label: "SELECT GAME", value: "" },
                    ...games.map((game) => ({
                      label: game.name.toUpperCase(),
                      value: game.id,
                    })),
                  ]}
                />

                <Input
                  label="PARTY TITLE"
                  value={form.title}
                  onChange={(value) => setForm((prev) => ({ ...prev, title: value }))}
                  placeholder="MYTHIC PUSH SQUAD"
                />

                <Input
                  label="DESCRIPTION"
                  value={form.description}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="NEED TEAM PUSH MALAM INI"
                />

                <Input
                  label="REGION"
                  value={form.region}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, region: value }))
                  }
                />

                <SelectBox
                  label="TARGET RANK"
                  value={form.target_rank}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, target_rank: value }))
                  }
                  options={defaultRanks.map((item) => ({
                    label: item.toUpperCase(),
                    value: item,
                  }))}
                />

                <SelectBox
                  label="YOUR ROLE"
                  value={form.selected_role}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, selected_role: value }))
                  }
                  options={defaultRoles.map((item) => ({
                    label: item.toUpperCase(),
                    value: item,
                  }))}
                />

                <SelectBox
                  label="ROOM TYPE"
                  value={form.room_type}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, room_type: value }))
                  }
                  options={[
                    { label: "PUBLIC", value: "public" },
                    { label: "PRIVATE", value: "private" },
                  ]}
                />

                <Input
                  label="GAME MODE"
                  value={form.game_mode}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, game_mode: value }))
                  }
                />
              </div>

              <button
                disabled={creating}
                className="mt-6 flex h-14 items-center justify-center border-2 border-black bg-[#53FC18] px-8 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {creating ? "CREATING..." : "CREATE ROOM"}
              </button>
            </form>
          )}

          <form
            onSubmit={handleJoinByCode}
            className="mt-10 border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="mb-5 border-b-2 border-black pb-3 text-xl font-black uppercase tracking-tight">
              // Join Private Room By Code
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="MBAR-7XK2"
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
              />

              <select
                value={joinCodeRole}
                onChange={(e) => setJoinCodeRole(e.target.value)}
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
              >
                {defaultRoles.map((roleItem) => (
                  <option key={roleItem} value={roleItem} className="bg-[#191B1F]">
                    {roleItem.toUpperCase()}
                  </option>
                ))}
              </select>

              <button className="h-14 border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Join Code
              </button>
            </div>
          </form>

          <div className="mt-10 grid gap-4 border-2 border-black bg-[#0E1318] p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:grid-cols-5">
            <select
              value={selectedGameId}
              onChange={(e) => handleSelectGame(e.target.value)}
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
            >
              <option value="">ALL GAMES</option>
              {games.map((game) => (
                <option key={game.id} value={game.id} className="bg-[#191B1F]">
                  {game.name.toUpperCase()}
                </option>
              ))}
            </select>

            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="REGION..."
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
            />

            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
            >
              <option value="">ALL RANK</option>
              {defaultRanks.map((rankItem) => (
                <option key={rankItem} value={rankItem} className="bg-[#191B1F]">
                  {rankItem.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-14 border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
            >
              <option value="">ALL ROLE</option>
              {defaultRoles.map((roleItem) => (
                <option key={roleItem} value={roleItem} className="bg-[#191B1F]">
                  {roleItem.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={() => loadRooms()}
              className="flex h-14 items-center justify-center border-2 border-black bg-[#191B1F] text-xs font-black uppercase tracking-wider text-[#53FC18] transition-all hover:bg-black active:bg-neutral-900"
            >
              SEARCH PARTY
            </button>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {loading ? (
              <div className="col-span-full border-2 border-black bg-[#0E1318] p-8 text-xs font-bold uppercase tracking-wider text-zinc-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ⏳ LOADING PARTY ROOMS...
              </div>
            ) : rooms.length === 0 ? (
              <div className="col-span-full border-2 border-black bg-[#0E1318] p-8 text-xs font-bold uppercase tracking-wider text-zinc-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ⚠️ BELUM ADA PARTY ROOM UNTUK FILTER INI.
              </div>
            ) : (
              rooms.map((room) => {
                const isMember = room.party_members?.some(
                  (member) => member.user_id === user?.id
                )

                const isOwner = room.party_members?.some(
                  (member) => member.user_id === user?.id && member.is_owner
                )

                return (
                  <PartyCard
                    key={room.id}
                    id={room.id}
                    title={room.title}
                    rank={room.average_rank || room.target_rank || "ANY RANK"}
                    maxPlayers={room.max_players}
                    players={room.party_members?.length || 0}
                    missingRoles={room.missing_roles}
                    game={room.games?.name}
                    region={room.region}
                    status={room.status}
                    roomType={room.room_type}
                    roomCode={room.room_code}
                    cooldownUntil={room.cooldown_until}
                    members={room.party_members}
                    isMember={isMember}
                    isOwner={isOwner}
                    onJoin={() => handleJoin(room.id, room.room_type)}
                    onLeave={() => handleLeaveRoom(room.id)}
                    onOpenChat={() => handleOpenRoomChat(room.id)}
                  />
                )
              })
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase text-white outline-none transition focus:border-[#53FC18]"
      />
    </div>
  )
}

function SelectBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: {
    label: string
    value: string
  }[]
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase text-white outline-none transition focus:border-[#53FC18]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#191B1F]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}