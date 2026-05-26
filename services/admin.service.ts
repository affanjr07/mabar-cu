import { api } from "@/lib/axios"

export async function getAdminAnalytics() {
  const res = await api.get("/admin/analytics")
  return res.data
}

export async function getAdminUsers() {
  const res = await api.get("/admin/users")
  return res.data
}

export async function getAdminReports() {
  const res = await api.get("/admin/reports")
  return res.data
}

export async function getModerationLogs() {
  const res = await api.get("/admin/moderation-logs")
  return res.data
}

export async function banUser(
  userId: string,
  reason = "Melanggar aturan platform",
  banned_until?: string
) {
  const res = await api.patch(`/admin/users/${userId}/ban`, {
    reason,
    banned_until,
  })

  return res.data
}

export async function unbanUser(userId: string) {
  const res = await api.patch(`/admin/users/${userId}/unban`)
  return res.data
}

export async function muteUser(
  userId: string,
  reason = "Toxic chat",
  muted_until?: string
) {
  const res = await api.patch(`/admin/users/${userId}/mute`, {
    reason,
    muted_until,
  })

  return res.data
}

export async function unmuteUser(userId: string) {
  const res = await api.patch(`/admin/users/${userId}/unmute`)
  return res.data
}

export async function createAnnouncement(data: {
  title: string
  message: string
  starts_at?: string
  ends_at?: string
}) {
  const res = await api.post("/admin/announcements", data)
  return res.data
}

export async function getAdminAnnouncements() {
  const res = await api.get("/admin/announcements")
  return res.data
}

export async function deleteAnnouncement(announcementId: string) {
  const res = await api.delete(`/admin/announcements/${announcementId}`)
  return res.data
}

export async function createTournament(data: any) {
  const res = await api.post("/tournaments", data)
  return res.data
}

export async function updateTournament(tournamentId: string, data: any) {
  const res = await api.put(`/tournaments/${tournamentId}`, data)
  return res.data
}

export async function deleteTournament(tournamentId: string) {
  const res = await api.delete(`/tournaments/${tournamentId}`)
  return res.data
}

export async function getTournamentParticipants(tournamentId: string) {
  const res = await api.get(`/tournaments/${tournamentId}/participants`)
  return res.data
}