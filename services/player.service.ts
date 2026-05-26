import { api } from "@/lib/axios"

export async function searchPlayers(q = "", limit = 15, offset = 0) {
  const res = await api.get("/players/search", {
    params: { q, limit, offset },
  })

  return res.data
}

export async function getFollowedPlayers(limit = 15, offset = 0) {
  const res = await api.get("/players/followed", {
    params: { limit, offset },
  })

  return res.data
}