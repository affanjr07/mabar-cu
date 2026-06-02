"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import PartyCard from "@/components/matchmaking/PartyCard"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MabarLoading from "@/components/ui/MabarLoading"
import { getGames } from "@/services/game.service"
import { useAuthStore } from "@/store/auth.store"
import {
  createPartyRoom,
  getPartyRooms,
  joinPartyRoom,
  joinPartyRoomByCode,
  leavePartyRoom,
} from "@/services/matchmaking.service"
import {
  AlertTriangle,
  Lock,
  Plus,
  Search,
  ShieldAlert,
  Swords,
  X,
} from "lucide-react"

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
  profiles?: {
    id?: string
    username?: string
    display_name?: string
    avatar_url?: string
    online_status?: boolean
    equipped_avatar_border?: any
    equipped_badges?: any[]
  }
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
  expires_at?: string
  party_members?: PartyMember[]
  games?: {
    id: string
    name: string
    genre: string
    roles?: string[]
    ranks?: string[]
  }
}

const FALLBACK_RANKS = ["Casual", "Beginner", "Intermediate", "Advanced"]
const FLEX_ROLE = "Flex"

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
  const [joinCodeRole, setJoinCodeRole] = useState(FLEX_ROLE)

  const [roleModal, setRoleModal] = useState({
    show: false,
    roomId: "",
    availableRoles: [] as string[],
    selectedRole: FLEX_ROLE,
  })

  const [triangleAlert, setTriangleAlert] = useState({
    show: false,
    title: "",
    message: "",
  })

  const selectedGame = games.find((game) => game.id === selectedGameId)
  const selectedRoles = selectedGame?.roles?.length ? selectedGame.roles : []
  const selectedRanks = selectedGame?.ranks?.length
    ? selectedGame.ranks
    : FALLBACK_RANKS

  const [form, setForm] = useState({
    game_id: "",
    title: "",
    description: "",
    room_type: "public",
    game_mode: "Ranked",
    target_rank: "Casual",
    region: "Indonesia",
    max_players: 5,
    selected_role: FLEX_ROLE,
    required_roles: [] as string[],
  })

  async function loadGames() {
    try {
      const data = await getGames()
      setGames(data || [])
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

      setRooms(data || [])
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL MENGAMBIL ROOM")
    } finally {
      setLoading(false)
    }
  }

  function handleApiError(error: any, fallback: string) {
    if (error.response?.data?.code === "ACTIVE_ROOM_EXISTS") {
      setTriangleAlert({
        show: true,
        title: "KAMU SUDAH BERADA DI ROOM",
        message: "Keluar dulu dari room sekarang untuk masuk ke room ini.",
      })
      return
    }

    setMessage(error.response?.data?.message || fallback)
  }

  function handleSelectGame(gameId: string) {
    setSelectedGameId(gameId)
    setRole("")
    setRank("")

    const game = games.find((item) => item.id === gameId)

    if (game) {
      const roles = game.roles?.length ? game.roles : []
      const ranks = game.ranks?.length ? game.ranks : FALLBACK_RANKS

      setForm((prev) => ({
        ...prev,
        game_id: game.id,
        max_players: game.max_party_size || 5,
        required_roles: roles,
        selected_role: roles[0] || FLEX_ROLE,
        target_rank: ranks[0] || "Casual",
      }))

      setJoinCodeRole(roles[0] || FLEX_ROLE)
    }

    loadRooms(gameId)
  }

  function handleOpenCreate() {
    const firstGame = games[0]

    if (!form.game_id && firstGame) {
      const roles = firstGame.roles?.length ? firstGame.roles : []
      const ranks = firstGame.ranks?.length ? firstGame.ranks : FALLBACK_RANKS

      setForm((prev) => ({
        ...prev,
        game_id: firstGame.id,
        max_players: firstGame.max_party_size || 5,
        required_roles: roles,
        selected_role: roles[0] || FLEX_ROLE,
        target_rank: ranks[0] || "Casual",
      }))
    }

    setShowCreate(true)
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

      const selected = games.find((game) => game.id === form.game_id)
      const roles = selected?.roles?.length ? selected.roles : []

      const payload = {
        ...form,
        selected_role: roles.length ? form.selected_role : FLEX_ROLE,
        required_roles: roles,
        max_players: selected?.max_party_size || form.max_players,
      }

      const result = await createPartyRoom(payload)

      setShowCreate(false)

      const code = result?.room?.room_code || result?.room_code

      setMessage(
        form.room_type === "private" && code
          ? `⚡ PRIVATE ROOM DIBUAT! ROOM CODE: ${code}`
          : "⚡ PARTY ROOM BERHASIL DIBUAT!"
      )

      await loadRooms(form.game_id)
    } catch (error: any) {
      handleApiError(error, "GAGAL MEMBUAT PARTY")
    } finally {
      setCreating(false)
    }
  }

  function handleJoinInitiate(roomId: string, roomType?: string) {
    setMessage("")

    if (roomType === "private") {
      setMessage("PRIVATE ROOM WAJIB JOIN LEWAT ROOM CODE DI FORM JOIN CODE.")
      return
    }

    const targetRoom = rooms.find((room) => room.id === roomId)
    const roomRoles = targetRoom?.games?.roles?.length
      ? targetRoom.games.roles
      : []
    const missingRoles = targetRoom?.missing_roles?.length
      ? targetRoom.missing_roles
      : []
    const availableRoles = missingRoles.length
      ? missingRoles
      : roomRoles.length
        ? roomRoles
        : [FLEX_ROLE]

    setRoleModal({
      show: true,
      roomId,
      availableRoles,
      selectedRole: availableRoles[0] || FLEX_ROLE,
    })
  }

  async function handleConfirmJoin() {
    try {
      setMessage("")

      await joinPartyRoom(roomModalRoomId(), roleModal.selectedRole || FLEX_ROLE)

      setRoleModal({
        show: false,
        roomId: "",
        availableRoles: [],
        selectedRole: FLEX_ROLE,
      })

      setMessage("⚡ BERHASIL JOIN PARTY.")
      await loadRooms()
    } catch (error: any) {
      handleApiError(error, "GAGAL JOIN PARTY")
    }
  }

  function roomModalRoomId() {
    return roleModal.roomId
  }

  async function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault()

    try {
      setMessage("")

      if (!roomCode.trim()) {
        setMessage("ROOM CODE WAJIB DIISI.")
        return
      }

      await joinPartyRoomByCode(roomCode.trim(), joinCodeRole || FLEX_ROLE)

      setMessage("⚡ BERHASIL JOIN PRIVATE ROOM.")
      setRoomCode("")
      await loadRooms()
    } catch (error: any) {
      handleApiError(error, "GAGAL JOIN PRIVATE ROOM")
    }
  }

  async function handleLeave(roomId: string) {
    try {
      setMessage("")

      await leavePartyRoom(roomId)

      setMessage("BERHASIL KELUAR DARI PARTY.")
      await loadRooms()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "GAGAL KELUAR PARTY")
    }
  }

  function isMyRoom(room: PartyRoom) {
    return Boolean(room.party_members?.some((member) => member.user_id === user?.id))
  }

  function isOwner(room: PartyRoom) {
    return room.owner_id === user?.id
  }

  function normalizeMembers(members?: PartyMember[]) {
    return (members || []).map((member) => ({
      ...member,
      profiles: {
        ...member.profiles,
        username:
          member.profiles?.username ||
          member.profiles?.display_name ||
          "Unknown Player",
        display_name:
          member.profiles?.username ||
          member.profiles?.display_name ||
          "Unknown Player",
        avatar_url: member.profiles?.avatar_url || "",
        equipped_avatar_border: member.profiles?.equipped_avatar_border || null,
      },
    }))
  }

  useEffect(() => {
    loadGames()
    loadRooms()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <MabarLoading/>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black">
        <Sidebar />

        {triangleAlert.show && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_#facc15]">
              <div className="mb-4 flex h-16 w-16 items-center justify-center border-4 border-black bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertTriangle size={34} />
              </div>

              <h2 className="text-2xl font-black uppercase tracking-tight text-yellow-400">
                {triangleAlert.title}
              </h2>

              <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-zinc-400">
                {triangleAlert.message}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setTriangleAlert({ show: false, title: "", message: "" })
                  }
                  className="border-2 border-black bg-zinc-800 py-3 text-xs font-black uppercase text-white hover:bg-zinc-700"
                >
                  Mengerti
                </button>

                <button
                  onClick={() => {
                    setTriangleAlert({ show: false, title: "", message: "" })
                    router.push("/party")
                  }}
                  className="border-2 border-black bg-yellow-400 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cek Room Saya
                </button>
              </div>
            </div>
          </div>
        )}

        {roleModal.show && (
          <div className="fixed inset-0 z-[998] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_#53FC18]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-black bg-[#53FC18] text-black">
                <Swords size={22} />
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                PILIH ROLE KAMU
              </h2>

              <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500">
                Untuk game tanpa role khusus, sistem otomatis memakai Flex.
              </p>

              <div className="mt-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Role List
                </label>

                <select
                  value={roleModal.selectedRole}
                  onChange={(e) =>
                    setRoleModal((prev) => ({
                      ...prev,
                      selectedRole: e.target.value,
                    }))
                  }
                  className="mt-2 h-12 w-full border-2 border-black bg-[#191B1F] px-3 text-xs font-black uppercase outline-none focus:border-[#53FC18]"
                >
                  {roleModal.availableRoles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRoleModal({
                      show: false,
                      roomId: "",
                      availableRoles: [],
                      selectedRole: FLEX_ROLE,
                    })
                  }
                  className="border-2 border-black bg-zinc-800 py-3 text-xs font-black uppercase text-white hover:bg-zinc-700"
                >
                  Batal
                </button>

                <button
                  onClick={handleConfirmJoin}
                  className="border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b]"
                >
                  Selesai & Join
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="custom-scrollbar flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="flex flex-col justify-between gap-6 border-b-2 border-[#191B1F] pb-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                // MATCHMAKING SYSTEM
              </div>

              <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                Cari Teman <span className="text-[#53FC18]">Mabar</span>
              </h1>

              <p className="mt-3 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-500">
                Role dan rank otomatis mengikuti game yang kamu pilih dari database.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex h-12 items-center gap-2 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={16} />
              Create Room
            </button>
          </div>

          {message && (
            <div className="mt-6 flex items-center justify-between border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span>{message}</span>
              <button
                onClick={() => setMessage("")}
                className="text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <FilterBox label="Game">
              <select
                value={selectedGameId}
                onChange={(e) => handleSelectGame(e.target.value)}
                className="input-gaming"
              >
                <option value="">SEMUA GAME</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name} • {game.genre}
                  </option>
                ))}
              </select>
            </FilterBox>

            <FilterBox label="Role Dibutuhkan">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={selectedRoles.length === 0}
                className="input-gaming disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {selectedRoles.length ? "SEMUA ROLE" : "GAME INI TANPA ROLE"}
                </option>

                {selectedRoles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FilterBox>

            <FilterBox label="Rank">
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="input-gaming"
              >
                <option value="">SEMUA RANK</option>
                {selectedRanks.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </FilterBox>

            <FilterBox label="Region">
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Indonesia"
                className="input-gaming placeholder:text-zinc-600"
              />
            </FilterBox>
          </div>

          {selectedGame && (
            <div className="mt-4 border-2 border-black bg-[#0E1318] p-4 text-xs font-black uppercase text-zinc-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[#53FC18]">{selectedGame.name}</span> •{" "}
              {selectedGame.genre} • Max Party {selectedGame.max_party_size || 5} •{" "}
              {selectedRoles.length
                ? `Roles: ${selectedRoles.join(", ")}`
                : "No fixed roles"}
            </div>
          )}

          <button
            onClick={() => loadRooms()}
            className="mt-4 flex h-12 items-center justify-center gap-2 border-2 border-black bg-[#191B1F] px-6 text-xs font-black uppercase tracking-widest text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black"
          >
            <Search size={16} />
            Filter Room
          </button>

          <form
            onSubmit={handleJoinByCode}
            className="mt-8 grid gap-3 border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:grid-cols-[1fr_220px_180px]"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Private Room Code
              </label>

              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="MBAR-XXXX"
                className="input-gaming mt-2 tracking-widest"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Role
              </label>

              <select
                value={joinCodeRole}
                onChange={(e) => setJoinCodeRole(e.target.value)}
                className="input-gaming mt-2"
              >
                {(selectedRoles.length ? selectedRoles : [FLEX_ROLE]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button className="mt-auto flex h-12 items-center justify-center gap-2 border-2 border-black bg-yellow-400 text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Lock size={16} />
              Join Code
            </button>
          </form>

          {showCreate && (
            <CreateRoomModal
              games={games}
              form={form}
              setForm={setForm}
              creating={creating}
              onClose={() => setShowCreate(false)}
              onSubmit={handleCreateParty}
            />
          )}

          <div className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Active Rooms
                </h2>

                <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                  Room menyesuaikan game, role, rank, avatar, dan username player.
                </p>
              </div>

              <div className="border-2 border-black bg-[#191B1F] px-4 py-2 text-xs font-black uppercase text-[#53FC18]">
                {rooms.length} Rooms
              </div>
            </div>

            {rooms.length === 0 ? (
              <div className="border-2 border-dashed border-[#191B1F] bg-[#0E1318] p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-500">
                <ShieldAlert className="mx-auto mb-3 text-zinc-600" size={28} />
                Belum ada party room yang tersedia.
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {rooms.map((room) => (
                  <PartyCard
                    key={room.id}
                    id={room.id}
                    title={room.title}
                    rank={room.target_rank || room.average_rank || "Any Rank"}
                    players={room.party_members?.length || 0}
                    maxPlayers={room.max_players}
                    missingRoles={room.missing_roles || []}
                    game={room.games?.name || "Unknown Game"}
                    region={room.region || "Global"}
                    status={room.status}
                    roomType={room.room_type}
                    roomCode={room.room_code}
                    cooldownUntil={room.cooldown_until}
                    expiresAt={room.expires_at}
                    members={normalizeMembers(room.party_members)}
                    isMember={isMyRoom(room)}
                    isOwner={isOwner(room)}
                    onJoin={() => handleJoinInitiate(room.id, room.room_type)}
                    onLeave={() => handleLeave(room.id)}
                    onOpenChat={() => router.push(`/rooms/${room.id}/chat`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function FilterBox({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function CreateRoomModal({
  games,
  form,
  setForm,
  creating,
  onClose,
  onSubmit,
}: {
  games: Game[]
  form: any
  setForm: React.Dispatch<React.SetStateAction<any>>
  creating: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  const selectedGame = games.find((game) => game.id === form.game_id)
  const roles = selectedGame?.roles?.length ? selectedGame.roles : []
  const ranks = selectedGame?.ranks?.length ? selectedGame.ranks : FALLBACK_RANKS

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_#53FC18]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Create Party Room
            </h2>

            <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
              Role dan rank otomatis berubah sesuai game.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border-2 border-black bg-red-600 p-2 text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <InputBox label="Title">
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Push Rank Malam Ini"
              className="input-gaming"
            />
          </InputBox>

          <InputBox label="Game">
            <select
              value={form.game_id}
              onChange={(e) => {
                const gameId = e.target.value
                const game = games.find((item) => item.id === gameId)
                const nextRoles = game?.roles?.length ? game.roles : []
                const nextRanks = game?.ranks?.length
                  ? game.ranks
                  : FALLBACK_RANKS

                setForm((prev: any) => ({
                  ...prev,
                  game_id: gameId,
                  max_players: game?.max_party_size || 5,
                  required_roles: nextRoles,
                  selected_role: nextRoles[0] || FLEX_ROLE,
                  target_rank: nextRanks[0] || "Casual",
                }))
              }}
              className="input-gaming"
            >
              <option value="">PILIH GAME</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name} • {game.genre}
                </option>
              ))}
            </select>
          </InputBox>

          <InputBox label="Room Type">
            <select
              value={form.room_type}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  room_type: e.target.value,
                }))
              }
              className="input-gaming"
            >
              <option value="public">PUBLIC</option>
              <option value="private">PRIVATE</option>
            </select>
          </InputBox>

          <InputBox label="Game Mode">
            <input
              value={form.game_mode}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  game_mode: e.target.value,
                }))
              }
              className="input-gaming"
            />
          </InputBox>

          <InputBox label="Target Rank">
            <select
              value={form.target_rank}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  target_rank: e.target.value,
                }))
              }
              className="input-gaming"
            >
              {ranks.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </InputBox>

          <InputBox label="Your Role">
            {roles.length ? (
              <select
                value={form.selected_role}
                onChange={(e) =>
                  setForm((prev: any) => ({
                    ...prev,
                    selected_role: e.target.value,
                  }))
                }
                className="input-gaming"
              >
                {roles.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            ) : (
              <input value={FLEX_ROLE} readOnly className="input-gaming opacity-70" />
            )}
          </InputBox>

          <InputBox label="Region">
            <input
              value={form.region}
              onChange={(e) =>
                setForm((prev: any) => ({ ...prev, region: e.target.value }))
              }
              className="input-gaming"
            />
          </InputBox>

          <InputBox label="Max Players">
            <input
              type="number"
              min={2}
              max={50}
              value={form.max_players}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  max_players: Number(e.target.value),
                }))
              }
              className="input-gaming"
            />
          </InputBox>
        </div>

        <div className="mt-4">
          <InputBox label="Description">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev: any) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Butuh tim solid, no toxic, gas push rank."
              className="min-h-24 w-full border-2 border-black bg-[#191B1F] p-4 text-xs font-bold uppercase outline-none focus:border-[#53FC18]"
            />
          </InputBox>
        </div>

        <button
          disabled={creating}
          className="mt-6 h-12 w-full border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Party"}
        </button>
      </form>
    </div>
  )
}

function InputBox({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}