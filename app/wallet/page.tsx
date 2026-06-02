"use client"

import { useEffect, useMemo, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import MabarLoading from "@/components/ui/MabarLoading"
import {
  getMyWallet,
  topUpDemo,
  getWalletTransactions,
} from "@/services/economy.service"
import { api } from "@/lib/axios"
import { useAuthStore } from "@/store/auth.store"

export default function WalletPage() {
  const user = useAuthStore((state) => state.user)

  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [topupAmount, setTopupAmount] = useState(1000)
  const [targetEmail, setTargetEmail] = useState("")
  const [giftAmount, setGiftAmount] = useState(100)
  const [giftMessage, setGiftMessage] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const stats = useMemo(() => {
    const spent = transactions
      .filter((tx) =>
        ["buy_item", "shop_purchase", "pro_booking_payment", "gift"].includes(tx.type)
      )
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

    const received = transactions
      .filter((tx) =>
        ["gift_received", "pro_booking_income", "topup_demo"].includes(tx.type)
      )
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

    const giftSent = transactions
      .filter((tx) => tx.type === "gift")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

    const bookingSpent = transactions
      .filter((tx) => tx.type === "pro_booking_payment")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)

    return { spent, received, giftSent, bookingSpent }
  }, [transactions])

  async function loadData() {
    try {
      setLoading(true)

      const [walletData, transactionData] = await Promise.all([
        getMyWallet(),
        getWalletTransactions(),
      ])

      setWallet(walletData?.wallet || walletData)
      setTransactions(transactionData?.transactions || transactionData || [])
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil wallet.")
    } finally {
      setLoading(false)
    }
  }

  async function handleTopup() {
    try {
      setActionLoading(true)

      const amount = Number(topupAmount)

      if (!amount || amount <= 0) {
        setMessage("Jumlah topup tidak valid.")
        return
      }

      await topUpDemo(amount)
      setMessage("⚡ TOPUP DEMO BERHASIL.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal topup.")
    } finally {
      setActionLoading(false)
    }
  }

  function preCheckGift() {
    const email = targetEmail.trim().toLowerCase()
    const amount = Number(giftAmount)

    if (!email) {
      setMessage("Email target wajib diisi.")
      return
    }

    if (!email.includes("@")) {
      setMessage("Format email target tidak valid.")
      return
    }

    if (!amount || amount <= 0) {
      setMessage("Jumlah point tidak valid.")
      return
    }

    if (amount > Number(wallet?.balance || 0)) {
      setMessage("Point tidak mencukupi untuk melakukan gift.")
      return
    }

    if (user?.email && email === user.email.toLowerCase()) {
      setMessage("Tidak bisa gift point ke akun sendiri.")
      return
    }

    setShowConfirmModal(true)
  }

  async function handleGift() {
    try {
      setActionLoading(true)
      setShowConfirmModal(false)

      const payload = {
        target_email: targetEmail.trim().toLowerCase(),
        amount: Number(giftAmount),
        message: giftMessage.trim() || "Gift point dari wallet",
      }

      await api.post("/economy/wallet/gift", payload)

      setMessage(`⚡ POINT BERHASIL DIGIFT KE ${targetEmail.toUpperCase()}.`)
      setTargetEmail("")
      setGiftAmount(100)
      setGiftMessage("")
      await loadData()
    } catch (error: any) {
      console.log("GIFT ERROR DETAIL:", error.response?.data || error.message)
      setMessage(
        error.response?.data?.message ||
          "Gagal gift point. Cek email target dan saldo."
      )
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

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white selection:bg-[#53FC18] selection:text-black">
        <Sidebar />

        {loading ? (
          <section className="flex flex-1 items-center justify-center">
            <MabarLoading mode="section" />
          </section>
        ) : (
          <section className="custom-scrollbar relative flex-1 overflow-y-auto p-6 lg:p-10">
            {showConfirmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md border-4 border-black bg-[#0E1318] p-6 shadow-[8px_8px_0px_0px_#53FC18]">
                  <div className="mb-4 inline-block border border-red-500 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-400">
                    // CONFIRMATION_REQUIRED
                  </div>

                  <h3 className="mb-2 text-xl font-black uppercase text-white">
                    Transfer Point?
                  </h3>

                  <p className="mb-6 text-xs uppercase leading-relaxed text-zinc-400">
                    Kamu akan mengirim{" "}
                    <span className="font-black text-[#53FC18]">
                      {giftAmount} Points
                    </span>{" "}
                    ke{" "}
                    <span className="font-black text-white">{targetEmail}</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowConfirmModal(false)}
                      className="border-2 border-black bg-zinc-800 py-3 text-xs font-black uppercase text-white hover:bg-zinc-700 disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={handleGift}
                      className="border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                    >
                      {actionLoading ? "Mengirim..." : "Kirim Sekarang"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                // WALLET SYSTEM
              </div>

              <h1 className="text-5xl font-black uppercase tracking-tight">
                Wallet
              </h1>

              <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
                Kelola point, gift point, dan riwayat transaksi akun.
              </p>
            </div>

            {message && (
              <div className="mt-8 flex items-center justify-between border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18]">
                <span>{message}</span>
                <button
                  onClick={() => setMessage("")}
                  className="ml-2 text-[10px] text-zinc-500 hover:text-white"
                >
                  [X]
                </button>
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <WalletCard label="Point Balance" value={wallet?.balance || 0} />
              <WalletCard label="Total Topup" value={wallet?.total_topup || 0} />
              <WalletCard label="Total Spent" value={stats.spent} danger />
              <WalletCard label="Point Received" value={stats.received} />
            </div>

            <div className="mt-10 grid gap-6 xl:grid-cols-2">
              {user?.role === "admin" && (
                <div className="flex flex-col justify-between border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <div>
                    <h2 className="text-xl font-black uppercase text-[#53FC18]">
                      Admin Demo Topup
                    </h2>

                    <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                      Fitur demo. Hanya admin yang bisa melakukan injeksi point.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-zinc-400">
                      Amount to Inject
                    </span>

                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={topupAmount}
                        onChange={(e) => setTopupAmount(Number(e.target.value))}
                        className="h-12 flex-1 border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none transition-colors focus:border-[#53FC18]"
                      />

                      <button
                        disabled={actionLoading}
                        onClick={handleTopup}
                        className="border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                      >
                        Topup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-black uppercase text-white">
                  Gift Points
                </h2>

                <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                  Kirim point ke player lain menggunakan email akun.
                </p>

                <div className="mt-5 space-y-4">
                  <InputLabel label="Target Email">
                    <input
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black outline-none transition-colors focus:border-[#53FC18]"
                    />
                  </InputLabel>

                  <InputLabel label="Amount Points">
                    <input
                      type="number"
                      value={giftAmount}
                      onChange={(e) => setGiftAmount(Number(e.target.value))}
                      placeholder="0"
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none transition-colors focus:border-[#53FC18]"
                    />
                  </InputLabel>

                  <InputLabel label="Optional Message">
                    <input
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="HAVE FUN!"
                      className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none transition-colors focus:border-[#53FC18]"
                    />
                  </InputLabel>

                  <button
                    disabled={actionLoading}
                    onClick={preCheckGift}
                    className="mt-2 w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                  >
                    Send Gift Package
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <WalletCard label="Gift Sent" value={stats.giftSent} />
              <WalletCard label="Booking Spent" value={stats.bookingSpent} danger />
              <WalletCard label="Total Transactions" value={transactions.length} />
            </div>

            <div className="mt-10 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="mb-6 text-2xl font-black uppercase tracking-tight">
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-700 bg-[#191B1F] p-6 text-center text-xs font-black uppercase text-zinc-500">
                  Belum ada records transaksi pada sistem ini.
                </div>
              ) : (
                <div className="custom-scrollbar max-h-[500px] space-y-3 overflow-y-auto pr-2">
                  {transactions.map((tx) => {
                    const isExpense = [
                      "gift",
                      "buy_item",
                      "shop_purchase",
                      "pro_booking_payment",
                    ].includes(tx.type)

                    return (
                      <div
                        key={tx.id}
                        className="flex flex-col justify-between gap-3 border-2 border-black bg-[#191B1F] p-4 transition-colors hover:bg-[#202329] md:flex-row md:items-center"
                      >
                        <div>
                          <span
                            className={`border px-2 py-0.5 text-[9px] font-black uppercase ${
                              isExpense
                                ? "border-red-500 bg-red-500/10 text-red-400"
                                : "border-[#53FC18] bg-[#53FC18]/10 text-[#53FC18]"
                            }`}
                          >
                            {tx.type}
                          </span>

                          <p className="mt-2 text-[11px] font-bold uppercase text-zinc-300">
                            {tx.message || "Wallet transaction record"}
                          </p>

                          <p className="mt-1 text-[9px] font-black uppercase text-zinc-600">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-left md:flex-col md:items-end md:border-none md:pt-0 md:text-right">
                          <p
                            className={`text-xl font-black ${
                              isExpense ? "text-red-400" : "text-[#53FC18]"
                            }`}
                          >
                            {isExpense ? "-" : "+"}
                            {tx.amount}
                          </p>

                          <span className="border border-zinc-800 bg-black/40 px-1.5 py-0.5 text-[9px] font-black uppercase text-zinc-500">
                            {tx.status || "SUCCESS"}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </ProtectedRoute>
  )
}

function InputLabel({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-black uppercase text-zinc-400">
        {label}
      </span>
      {children}
    </div>
  )
}

function WalletCard({
  label,
  value,
  danger,
}: {
  label: string
  value: number
  danger?: boolean
}) {
  return (
    <div
      className={`border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px] ${
        danger ? "border-red-500/50 text-red-400" : "border-zinc-800 text-[#53FC18]"
      }`}
    >
      <h2 className="text-4xl font-black tracking-tight">{value}</h2>

      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  )
}