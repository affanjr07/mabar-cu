import { api } from "@/lib/axios"

export async function getPartyRooms(params?: {
  role?: string
  rank?: string
  region?: string
  gameId?: string
}) {
  const res = await api.get("/matchmaking/rooms", {
    params,
  })

  return res.data
}

export async function createPartyRoom(data: any) {
  const res = await api.post("/matchmaking/rooms", data)
  return res.data
}

export async function joinPartyRoom(roomId: string, role_in_game: string) {
  const res = await api.post(`/matchmaking/rooms/${roomId}/join`, {
    role_in_game,
  })

  return res.data
}

export async function joinPartyRoomByCode(
  room_code: string,
  role_in_game: string
) {
  const res = await api.post("/matchmaking/rooms/join-by-code", {
    room_code,
    role_in_game,
  })

  return res.data
}

export async function leavePartyRoom(roomId: string) {
  const res = await api.delete(`/matchmaking/rooms/${roomId}/leave`)
  return res.data
}