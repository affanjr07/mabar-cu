import { api } from "@/lib/axios"

export async function getOnlinePlayers() {
  const res = await api.get("/players/search")
  return res.data
}

export async function searchPlayers(keyword: string) {
  const res = await api.get(`/players/search?q=${keyword}`)
  return res.data
}

export async function getTournaments() {
  const res = await api.get("/tournaments?status=upcoming")
  return res.data
}