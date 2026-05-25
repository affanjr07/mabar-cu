"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProPlayerRoute from "@/components/auth/ProPlayerRoute"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import {
  acceptProBooking,
  getMyBookings,
  getMyProSettings,
  rejectProBooking,
  updateMyProSettings,
} from "@/services/pro.service"

export default function ProDashboardPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [settings, setSettings] = useState({
    price_per_hour: 1000,
    available_games: "Mobile Legends, Valorant",
    description: "",
    is_accepting_booking: true,
  })

  async function loadData() {
    try {
      const [bookingData, settingData] = await Promise.all([
        getMyBookings(),
        getMyProSettings(),
      ])

      setBookings(bookingData)

      if (settingData) {
        setSettings({
          price_per_hour: settingData.price_per_hour || 1000,
          available_games: settingData.available_games?.join(", ") || "",
          description: settingData.description || "",
          is_accepting_booking: settingData.is_accepting_booking ?? true,
        })
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil data pro dashboard")
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()

    try {
      await updateMyProSettings({
        price_per_hour: Number(settings.price_per_hour),
        available_games: settings.available_games
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        description: settings.description,
        is_accepting_booking: settings.is_accepting_booking,
      })

      setMessage("Setting pro player berhasil disimpan.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal simpan setting")
    }
  }

  async function handleAccept(id: string) {
    try {
      await acceptProBooking(id)
      setMessage("Booking berhasil diterima.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal accept booking")
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("Alasan reject:", "Jadwal bentrok")
    if (!reason) return

    try {
      await rejectProBooking(id, reason)
      setMessage("Booking berhasil ditolak.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal reject booking")
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <ProPlayerRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
              // PRO PLAYER DASHBOARD
            </div>

            <h1 className="text-4xl font-black uppercase">
              Manage VIP Booking
            </h1>

            <p className="mt-3 text-xs font-bold uppercase text-zinc-500">
              Atur harga VIP dan accept/reject booking dari player.
            </p>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18]">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSaveSettings}
            className="mt-10 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-2xl font-black uppercase">
              Pro Settings
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                type="number"
                value={settings.price_per_hour}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    price_per_hour: Number(e.target.value),
                  }))
                }
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />

              <input
                value={settings.available_games}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    available_games: e.target.value,
                  }))
                }
                placeholder="AVAILABLE GAMES"
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
              />

              <input
                value={settings.description}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                placeholder="DESCRIPTION"
                className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none md:col-span-2"
              />

              <label className="flex items-center gap-3 text-xs font-black uppercase">
                <input
                  type="checkbox"
                  checked={settings.is_accepting_booking}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      is_accepting_booking: e.target.checked,
                    }))
                  }
                />
                Accepting Booking
              </label>
            </div>

            <button className="mt-6 border-2 border-black bg-[#53FC18] px-8 py-4 text-xs font-black uppercase text-black">
              Save Settings
            </button>
          </form>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black uppercase">
              Incoming Bookings
            </h2>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-zinc-500">
                  Belum ada booking.
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <p className="text-sm font-black uppercase">
                      {booking.game} • {booking.duration_hours} Hour
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                      Status: {booking.status} • Payment: {booking.payment_status}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-[#53FC18]">
                      Price: {booking.price} pts
                    </p>

                    <p className="mt-3 text-xs font-bold uppercase text-zinc-400">
                      Note: {booking.note || "-"}
                    </p>

                    {booking.status === "pending" && (
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => handleAccept(booking.id)}
                          className="border-2 border-black bg-[#53FC18] px-5 py-3 text-xs font-black uppercase text-black"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleReject(booking.id)}
                          className="border-2 border-black bg-red-600 px-5 py-3 text-xs font-black uppercase text-white"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </ProPlayerRoute>
  )
}