import { api } from "@/lib/axios"

export async function getGames() {
  const res = await api.get("/games")
  return res.data
}