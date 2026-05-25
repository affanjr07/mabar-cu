"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import {
  createProBooking,
  getMyBookings,
  getProPlayers,
  payDemoBooking,
} from "@/services/pro.service"

export default function ProPage() {
  const [proPlayers, setProPlayers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [selectedPro, setSelectedPro] = useState<any>(null)

  const [form, setForm] = useState({
    game: "Mobile Legends",
    duration_hours: 1,
    scheduled_at: "",
    note: "",
  })

  async function loadData() {
    try {
      const [playersData, bookingsData] = await Promise.all([
        getProPlayers(),
        getMyBookings(),
      ])

      console.log("PRO PLAYERS:", playersData)

      setProPlayers(playersData)
      setBookings(bookingsData)
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Gagal mengambil data pro"
      )
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedPro) {
      setMessage("Pilih pro player terlebih dahulu.")
      return
    }

    try {
      const result = await createProBooking({
        pro_player_id: selectedPro.id,
        game: form.game,
        duration_hours: Number(form.duration_hours),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        note: form.note,
      })

      setMessage(
        `Booking dibuat. Total demo price: ${result.booking.price} points.`
      )

      setSelectedPro(null)

      await loadData()
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Gagal membuat booking"
      )
    }
  }

  async function handlePayDemo(bookingId: string) {
    try {
      await payDemoBooking(bookingId)

      setMessage(
        "Pembayaran demo berhasil. Menunggu pro player."
      )

      await loadData()
    } catch (error: any) {
      setMessage(
        error.response?.data?.message || "Gagal pay demo"
      )
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          {/* HEADER */}
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
              // VIP MABAR SYSTEM
            </div>

            <h1 className="text-4xl font-black uppercase">
              Book Pro Player
            </h1>

            <p className="mt-3 text-xs font-bold uppercase text-zinc-500">
              Booking pro player, bayar demo, lalu tunggu accept/reject.
            </p>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18]">
              {message}
            </div>
          )}

          {/* PRO PLAYERS */}
          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            {proPlayers.map((pro) => {
              const profile = Array.isArray(pro.profiles)
                ? pro.profiles[0]
                : pro.profiles

              const settings = Array.isArray(
                pro.pro_player_settings
              )
                ? pro.pro_player_settings[0]
                : pro.pro_player_settings

              console.log("PRO:", pro)
              console.log("SETTINGS:", settings)

              return (
                <div
                  key={pro.id}
                  className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                >
                  {/* PROFILE */}
                  <div className="flex items-center gap-4">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-16 w-16 border-2 border-black object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#191B1F] text-xl font-black">
                        {(profile?.username || pro.email)
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-black uppercase">
                        {profile?.display_name ||
                          profile?.username ||
                          pro.email}
                      </h2>

                      <p className="text-xs font-black uppercase text-[#53FC18]">
                        PRO PLAYER
                      </p>
                    </div>
                  </div>

                  {/* DESC */}
                  <p className="mt-5 text-xs font-bold uppercase text-zinc-500">
                    {settings?.description ||
                      "Pro player siap bantu push rank."}
                  </p>

                  {/* PRICE */}
                  <div className="mt-5 border-2 border-black bg-[#191B1F] p-4">
                    <p className="text-xs font-black uppercase text-zinc-500">
                      Price / Hour
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#53FC18]">
                      {settings?.price_per_hour ?? 1000} pts
                    </p>
                  </div>

                  {/* AVAILABLE GAMES */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {settings?.available_games?.map(
                      (game: string) => (
                        <div
                          key={game}
                          className="border border-black bg-[#53FC18]/10 px-2 py-1 text-[10px] font-black uppercase text-[#53FC18]"
                        >
                          {game}
                        </div>
                      )
                    )}
                  </div>

                  {/* BUTTON */}
                  <button
                    onClick={() => setSelectedPro(pro)}
                    className="mt-5 w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black"
                  >
                    Book VIP
                  </button>
                </div>
              )
            })}
          </div>

          {/* BOOKING FORM */}
          {selectedPro && (
            <form
              onSubmit={handleBooking}
              className="mt-12 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <h2 className="text-2xl font-black uppercase">
                Create Booking
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={form.game}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      game: e.target.value,
                    }))
                  }
                  placeholder="GAME"
                  className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
                />

                <input
                  type="number"
                  value={form.duration_hours}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      duration_hours: Number(e.target.value),
                    }))
                  }
                  className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
                />

                <input
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      scheduled_at: e.target.value,
                    }))
                  }
                  className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
                />

                <input
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      note: e.target.value,
                    }))
                  }
                  placeholder="NOTE"
                  className="h-14 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase outline-none"
                />
              </div>

              <button className="mt-6 border-2 border-black bg-[#53FC18] px-8 py-4 text-xs font-black uppercase text-black">
                Submit Booking
              </button>
            </form>
          )}

          {/* BOOKINGS */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black uppercase">
              My VIP Bookings
            </h2>

            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col justify-between gap-4 border-2 border-black bg-[#0E1318] p-5 md:flex-row md:items-center"
                >
                  <div>
                    <p className="text-sm font-black uppercase">
                      {booking.game} •{" "}
                      {booking.duration_hours} Hour
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-zinc-500">
                      Status: {booking.status} • Payment:{" "}
                      {booking.payment_status}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-[#53FC18]">
                      Price: {booking.price} pts
                    </p>
                  </div>

                  {booking.status === "pending_payment" && (
                    <button
                      onClick={() =>
                        handlePayDemo(booking.id)
                      }
                      className="border-2 border-black bg-[#53FC18] px-5 py-3 text-xs font-black uppercase text-black"
                    >
                      Pay Demo
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}