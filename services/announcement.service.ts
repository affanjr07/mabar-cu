import { api } from "@/lib/axios"

export async function getActiveAnnouncements() {
  const res = await api.get("/announcements/active")
  return res.data
}