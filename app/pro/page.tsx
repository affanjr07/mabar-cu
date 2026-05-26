"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/store/auth.store"
import {
  acceptProBooking,
  createProBooking,
  getMyProBookings,
  getProPlayers,
  payDemoBooking,
  rejectProBooking,
} from "@/services/pro.service"

export default function ProPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const [pros, setPros] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedPro, setSelectedPro] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    game: "Mobile Legends",
    duration_hours: 1,
    scheduled_at: "",
    note: "",
  })

  const playersRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function getProfile(pro: any) {
    return Array.isArray(pro?.profiles) ? pro.profiles[0] : pro?.profiles
  }

  function getSettings(pro: any) {
    return Array.isArray(pro?.pro_player_settings)
      ? pro.pro_player_settings[0]
      : pro?.pro_player_settings
  }

  function getProName(pro: any) {
    const profile = getProfile(pro)
    return profile?.display_name || profile?.username || pro?.email || "PRO PLAYER"
  }

  async function loadData() {
    try {
      setLoading(true)

      const [proData, bookingData] = await Promise.all([
        getProPlayers(),
        getMyProBookings(),
      ])

      setPros(Array.isArray(proData) ? proData : proData?.data || [])
      setBookings(
        Array.isArray(bookingData)
          ? bookingData
          : bookingData?.bookings || bookingData?.data || []
      )
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil data pro")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedPro?.id) {
      setMessage("Pilih pro player dulu.")
      return
    }

    if (!form.scheduled_at) {
      setMessage("Pilih jadwal booking dulu.")
      return
    }

    try {
      setActionLoading(true)

      await createProBooking({
        pro_player_id: selectedPro.id,
        game: form.game,
        duration_hours: Number(form.duration_hours),
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        note: form.note,
      })

      setMessage("Booking berhasil dibuat. Silakan bayar demo.")
      setSelectedPro(null)
      setForm({
        game: "Mobile Legends",
        duration_hours: 1,
        scheduled_at: "",
        note: "",
      })

      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membuat booking")
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePay(bookingId: string) {
    try {
      setActionLoading(true)

      await payDemoBooking(bookingId)

      setMessage("Pembayaran berhasil. Menunggu pro player menerima booking.")
      await loadData()
    } catch (error: any) {
      console.log("PAY BOOKING ERROR:", error.response?.data || error.message)
      setMessage(error.response?.data?.message || "Gagal bayar booking")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAccept(bookingId: string) {
    try {
      setActionLoading(true)

      await acceptProBooking(bookingId)

      setMessage("Booking diterima. Chat VIP sudah dibuka.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menerima booking")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(bookingId: string) {
    const reason = prompt("Alasan reject:", "Jadwal tidak tersedia")
    if (!reason) return

    try {
      setActionLoading(true)

      await rejectProBooking(bookingId, reason)

      setMessage("Booking ditolak. Jika sudah dibayar, point user dikembalikan.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal menolak booking")
    } finally {
      setActionLoading(false)
    }
  }

  function formatDate(date?: string) {
    if (!date) return "-"

    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPro && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }, [selectedPro])

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="custom-scrollbar flex-1 overflow-y-auto p-4 md:p-6 lg:p-10">
          <div className="relative mb-10 overflow-hidden border-4 border-black bg-gradient-to-r from-[#11161D] via-[#162214] to-[#0E1318] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="pointer-events-none absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-[#53FC18]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 border border-[#53FC18] bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#53FC18]" />
                  SEASONAL PROMO // LIMITED OFFER
                </div>

                <h1 className="bg-gradient-to-r from-white via-zinc-200 to-[#53FC18] bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent sm:text-4xl">
                  PUSH RANK BERSAMA PRO PLAYER PILIHAN
                </h1>

                <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-zinc-400">
                  Booking pro player, bayar pakai point demo, lalu buka akses VIP chat setelah booking diterima.
                </p>
              </div>

              <button
                onClick={() =>
                  playersRef.current?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-12 shrink-0 border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase tracking-widest text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
              >
                Cari Pro Player →
              </button>
            </div>
          </div>

          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-zinc-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              // PRO VIP BOOKING MANAGEMENT
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight">
              Booking Roster
            </h2>

            <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
              Pilih mentor, buat jadwal, bayar demo, lalu tunggu pro player menerima booking.
            </p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 flex items-center justify-between border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18]"
              >
                <span>⚡ SYSTEM_LOG: {message}</span>

                <button
                  onClick={() => setMessage("")}
                  className="ml-2 text-zinc-500 hover:text-white"
                >
                  [DISMISS]
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={playersRef} className="mt-10 scroll-mt-6">
            <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">
              // AVAILABLE_PRO_PLAYERS
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {loading ? (
                <div className="col-span-full border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-zinc-500">
                  ⌛ LOADING SQUAD LOGS FROM SERVER...
                </div>
              ) : pros.length === 0 ? (
                <div className="col-span-full border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-zinc-500">
                  ❌ TIDAK ADA PRO PLAYER YANG AKTIF SAAT INI.
                </div>
              ) : (
                pros.map((pro, index) => {
                  const profile = getProfile(pro)
                  const settings = getSettings(pro)
                  const isAvailable = settings
                    ? settings.is_accepting_booking
                    : true

                  return (
                    <motion.div
                      key={pro.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:border-[#53FC18]/60"
                    >
                      <div className="flex items-center gap-4">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile?.username || pro.email}
                            className="h-16 w-16 border-2 border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:border-[#53FC18]"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-black bg-[#191B1F] text-xl font-black text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {(profile?.username || pro.email || "P")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="overflow-hidden">
                          <h3 className="truncate text-lg font-black uppercase tracking-tight">
                            {profile?.display_name ||
                              profile?.username ||
                              pro.email}
                          </h3>

                          <p className="mt-0.5 text-xs font-black uppercase text-[#53FC18]">
                            {settings?.price_per_hour || 1000} POINT / JAM
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 min-h-[36px] text-xs font-bold uppercase leading-relaxed text-zinc-500 line-clamp-2">
                        {settings?.description ||
                          profile?.bio ||
                          "Pro player siap bantu push rank."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {(settings?.available_games || ["Mobile Legends"]).map(
                          (game: string) => (
                            <span
                              key={game}
                              className="border border-black bg-[#191B1F] px-2 py-0.5 text-[9px] font-black uppercase text-[#53FC18]"
                            >
                              {game}
                            </span>
                          )
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedPro(pro)}
                        disabled={!isAvailable}
                        className="mt-6 h-11 w-full border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-wider text-black transition-all duration-150 disabled:pointer-events-none disabled:bg-zinc-800 disabled:text-zinc-500"
                      >
                        {isAvailable ? "Booking Pro" : "Offline"}
                      </button>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          <AnimatePresence>
            {selectedPro && (
              <motion.form
                ref={formRef}
                onSubmit={handleCreateBooking}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-14 overflow-hidden border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:border-[#53FC18]/40"
              >
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                  // SECURE_TRANSACTION_PANEL
                </div>

                <h2 className="text-2xl font-black uppercase tracking-tight">
                  Create Booking
                </h2>

                <p className="mt-1 text-xs font-bold uppercase text-zinc-400">
                  Target Pro:{" "}
                  <span className="text-white">{getProName(selectedPro)}</span>
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                      Target Game
                    </label>

                    <input
                      value={form.game}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          game: e.target.value,
                        }))
                      }
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                      Durasi Bermain
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={form.duration_hours}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          duration_hours: Number(e.target.value),
                        }))
                      }
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                      Jadwal Sesi Mulai
                    </label>

                    <input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          scheduled_at: e.target.value,
                        }))
                      }
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
                      Catatan Tambahan
                    </label>

                    <textarea
                      value={form.note}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      placeholder="TULIS ROLE, HERO PREFERENCE, ATAU KETERANGAN LAINNYA..."
                      className="custom-scrollbar min-h-24 w-full border-2 border-black bg-[#191B1F] p-4 text-xs font-black uppercase text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    disabled={actionLoading}
                    className="h-12 border-2 border-black bg-[#53FC18] px-8 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-[#42cb13] disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Submit Order"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPro(null)}
                    className="h-12 border-2 border-black bg-zinc-800 px-8 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-zinc-700"
                  >
                    Close Form
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-14">
            <div className="mb-4 text-[11px] font-black uppercase tracking-widest text-zinc-500">
              // USER_BOOKING_HISTORY
            </div>

            <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">
              My Pro Bookings
            </h2>

            <div className="grid gap-4">
              {bookings.length === 0 ? (
                <div className="border-2 border-dashed border-black bg-[#0E1318] p-8 text-center text-xs font-black uppercase text-zinc-600">
                  [ NO TRANSACTION RECORDS LOGGED IN THIS ACCOUNT ]
                </div>
              ) : (
                bookings.map((booking, index) => {
                  const isProOwner =
                    booking.pro_player_id === user?.id ||
                    booking.pro_id === user?.id

                  const isRequester =
                    booking.requester_id === user?.id ||
                    booking.client_id === user?.id ||
                    booking.user_id === user?.id

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors hover:bg-[#11171D]"
                    >
                      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="border border-black bg-[#53FC18] px-2 py-0.5 text-[9px] font-black uppercase text-black">
                              STATUS: {booking.status}
                            </span>

                            <span className="border border-black bg-[#191B1F] px-2 py-0.5 text-[9px] font-black uppercase text-[#53FC18]">
                              FINANCE: {booking.payment_status}
                            </span>
                          </div>

                          <h4 className="mt-3 text-lg font-black uppercase tracking-tight text-white">
                            {booking.game || "VIP MABAR SESSION"}
                          </h4>

                          <div className="mt-2 space-y-0.5 text-[11px] font-bold uppercase text-zinc-500">
                            <p>
                              JADWAL LIVE: {formatDate(booking.scheduled_at)}
                            </p>

                            <p>
                              DURASI: {booking.duration_hours || 1} JAM //
                              PRICE: {booking.price || 0} POINTS
                            </p>
                          </div>

                          {booking.pro_earning ? (
                            <p className="mt-2 text-[10px] font-black uppercase text-[#53FC18]">
                              PRO EARNING: {booking.pro_earning} POINT •
                              PLATFORM FEE: {booking.platform_fee} POINT
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          {isRequester &&
                            booking.status === "pending_payment" &&
                            booking.payment_status === "unpaid" && (
                              <button
                                disabled={actionLoading}
                                onClick={() => handlePay(booking.id)}
                                className="h-10 border-2 border-black bg-[#53FC18] px-5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-[#45d413] disabled:opacity-50"
                              >
                                Pay Demo
                              </button>
                            )}

                          {isProOwner &&
                            booking.status === "pending" &&
                            booking.payment_status === "paid_demo" && (
                              <>
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleAccept(booking.id)}
                                  className="h-10 border-2 border-black bg-[#53FC18] px-5 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-[#45d413] disabled:opacity-50"
                                >
                                  Accept
                                </button>

                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleReject(booking.id)}
                                  className="h-10 border-2 border-black bg-red-600 px-5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-red-700 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                          {booking.status === "accepted" &&
                            booking.chat_id && (
                              <button
                                onClick={() =>
                                  router.push(`/pro/chat/${booking.chat_id}`)
                                }
                                className="h-10 border-2 border-black bg-[#191B1F] px-5 text-xs font-black uppercase tracking-wider text-[#53FC18] transition-all hover:bg-black"
                              >
                                Open VIP Chat
                              </button>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}