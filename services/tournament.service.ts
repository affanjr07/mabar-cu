import { api } from "@/lib/axios"

export async function getTournaments(params?: {
  status?: string
  gameId?: string
}) {
  const res = await api.get("/tournaments", {
    params,
  })

  return res.data
}

export async function getTournamentDetail(tournamentId: string) {
  const res = await api.get(`/tournaments/${tournamentId}`)
  return res.data
}

export async function registerTournament(
  tournamentId: string,
  team_name: string
) {
  const res = await api.post(`/tournaments/${tournamentId}/register`, {
    team_name,
  })

  return res.data
}

export async function unregisterTournament(tournamentId: string) {
  const res = await api.delete(`/tournaments/${tournamentId}/register`)
  return res.data
}