import { api } from "@/lib/axios"

export async function getOnlinePlayers(
  limit = 15,
  offset = 0
) {
  const res = await api.get("/players/search", {
    params: {
      limit,
      offset,
      online: true,
    },
  })

  return res.data
}

export async function searchPlayers(
  keyword: string,
  limit = 15,
  offset = 0
) {
  const res = await api.get("/players/search", {
    params: {
      q: keyword,
      limit,
      offset,
    },
  })

  return res.data
}

export async function getTournaments() {
  const res = await api.get("/tournaments?status=upcoming")
  return res.data
}

export async function getFollowedPlayers(
  limit = 15,
  offset = 0
) {
  const res = await api.get("/players/followed", {
    params: {
      limit,
      offset,
    },
  })

  return res.data
}