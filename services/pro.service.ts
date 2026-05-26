import { api } from "@/lib/axios"

export async function getProPlayers() {
  const res = await api.get("/pro/players")
  return res.data
}

export async function createProBooking(data: {
  pro_player_id: string
  game?: string
  game_id?: string
  duration_hours: number
  scheduled_at: string
  note?: string
}) {
  const res = await api.post("/pro/bookings", data)
  return res.data
}

export async function getMyProBookings() {
  const res = await api.get("/pro/bookings/me")
  return res.data
}

export async function getMyBookings() {
  return getMyProBookings()
}

export async function payDemoBooking(bookingId: string) {
  const res = await api.patch(`/pro/bookings/${bookingId}/pay-demo`)
  return res.data
}

export async function acceptProBooking(bookingId: string) {
  const res = await api.patch(`/pro/bookings/${bookingId}/accept`)
  return res.data
}

export async function rejectProBooking(bookingId: string, reason?: string) {
  const res = await api.patch(`/pro/bookings/${bookingId}/reject`, {
    reason,
  })

  return res.data
}

export async function getMyProSettings() {
  const res = await api.get("/pro/settings/me")
  return res.data
}

export async function updateMyProSettings(data: {
  price_per_hour: number
  available_games: string[]
  description: string
  is_accepting_booking: boolean
}) {
  const res = await api.put("/pro/settings/me", data)
  return res.data
}