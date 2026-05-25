"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AvatarFrame from "@/components/profile/AvatarFrame"
import EquippedBadges from "@/components/profile/EquippedBadges"
import {
  getMyWallet,
  topUpDemo,
  giftPoints,
  getShopItems,
  buyShopItem,
  getMyInventory,
} from "@/services/economy.service"
import { getMyProfile } from "@/services/profile.service"
import { useAuthStore } from "@/store/auth.store"

export default function WalletPage() {
  const user = useAuthStore((state) => state.user)

  const [wallet, setWallet] = useState<any>(null)
  const [shopItems, setShopItems] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  const [topupAmount, setTopupAmount] = useState(1000)

  const [targetEmail, setTargetEmail] = useState("")
  const [giftAmount, setGiftAmount] = useState(100)
  const [giftMessage, setGiftMessage] = useState("")

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadData() {
    try {
      setLoading(true)

      const [walletData, itemsData, inventoryData, profileData] =
        await Promise.all([
          getMyWallet(),
          getShopItems(),
          getMyInventory(),
          getMyProfile(),
        ])

      setWallet(walletData)
      setShopItems(itemsData || [])
      setInventory(inventoryData || [])
      setProfile(profileData)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil wallet")
    } finally {
      setLoading(false)
    }
  }

  async function handleTopup() {
    try {
      await topUpDemo(Number(topupAmount))

      setMessage("⚡ TOPUP DEMO BERHASIL.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal topup")
    }
  }

  async function handleGift() {
  try {
    if (!targetEmail.trim()) {
      setMessage("Email target wajib diisi.")
      return
    }

    if (!giftAmount || Number(giftAmount) <= 0) {
      setMessage("Jumlah point tidak valid.")
      return
    }

    await giftPoints({
      target_email: targetEmail.trim().toLowerCase(),
      amount: Number(giftAmount),
      message: giftMessage,
    })

    setMessage("⚡ POINT BERHASIL DIGIFT.")
    setTargetEmail("")
    setGiftMessage("")

    await loadData()
  } catch (error: any) {
    console.log("GIFT ERROR:", error.response?.data)
    setMessage(error.response?.data?.message || "Gagal gift point")
  }
}

  async function handleBuy(itemId: string) {
    try {
      await buyShopItem(itemId)

      setMessage("⚡ ITEM BERHASIL DIBELI.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membeli item")
    }
  }

  function alreadyOwned(itemId: string) {
    return inventory.some((item) => item.shop_items?.id === itemId)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
          <Sidebar />

          <section className="flex flex-1 items-center justify-center">
            <div className="border-2 border-black bg-[#0E1318] p-6 text-xs font-black uppercase text-[#53FC18]">
              LOADING WALLET...
            </div>
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
              // ECONOMY SYSTEM
            </div>

            <h1 className="text-5xl font-black uppercase tracking-tight">
              Wallet & Shop
            </h1>

            <p className="mt-4 text-xs font-bold uppercase text-zinc-500">
              BELI BADGE, AVATAR BORDER, DAN GIFT POINT KE PLAYER LAIN.
            </p>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase text-[#53FC18]">
              {message}
            </div>
          )}

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <WalletCard label="POINT BALANCE" value={wallet?.balance || 0} />
            <WalletCard label="TOTAL TOPUP" value={wallet?.total_topup || 0} />
            <WalletCard label="TOTAL GIFT" value={wallet?.total_gift_sent || 0} />
          </div>

          {user?.role === "admin" && (
            <div className="mt-10 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black uppercase">
                ADMIN DEMO TOPUP
              </h2>

              <div className="mt-5 flex gap-3">
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(Number(e.target.value))}
                  className="h-12 flex-1 border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none"
                />

                <button
                  onClick={handleTopup}
                  className="border-2 border-black bg-[#53FC18] px-6 text-xs font-black uppercase text-black"
                >
                  Topup Demo
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase">
              Gift Points
            </h2>

            <div className="mt-5 space-y-4">
              <input
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="TARGET USER EMAIL"
                className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none"
              />

              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(Number(e.target.value))}
                placeholder="AMOUNT"
                className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none"
              />

              <input
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="OPTIONAL MESSAGE"
                className="h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-black uppercase outline-none"
              />

              <button
                onClick={handleGift}
                className="w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black"
              >
                SEND GIFT
              </button>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-black uppercase">
              Cosmetic Shop
            </h2>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {shopItems.map((item) => {
                const isAvatarBorder = item.type === "avatar_border"
                const isBadge = item.type === "badge"
                const owned = alreadyOwned(item.id)

                return (
                  <div
                    key={item.id}
                    className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-black uppercase text-[#53FC18]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[10px] font-black uppercase text-zinc-500">
                          {item.type}
                        </p>
                      </div>

                      <span className="border border-black bg-black px-2 py-1 text-[9px] font-black uppercase text-[#53FC18]">
                        {item.rarity}
                      </span>
                    </div>

                    <div className="mt-5 flex min-h-48 items-center justify-center border-2 border-black bg-[#191B1F] p-5">
                      {isAvatarBorder ? (
                        <AvatarFrame
                          avatarUrl={profile?.avatar_url}
                          username={profile?.username || "M"}
                          border={item}
                          size="shop"
                        />
                      ) : isBadge ? (
                        <EquippedBadges badges={[item]} />
                      ) : item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-40 w-full object-contain"
                        />
                      ) : (
                        <p className="text-xs font-black uppercase text-zinc-500">
                          NO PREVIEW IMAGE
                        </p>
                      )}
                    </div>

                    <p className="mt-4 min-h-10 text-xs font-bold uppercase text-zinc-500">
                      {item.description || "COSMETIC ITEM MABAR.CU"}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-sm font-black uppercase text-white">
                        {item.price} POINT
                      </p>

                      <button
                        disabled={owned}
                        onClick={() => handleBuy(item.id)}
                        className="border-2 border-black bg-[#53FC18] px-4 py-2 text-[10px] font-black uppercase text-black disabled:bg-yellow-400"
                      >
                        {owned ? "OWNED" : "BUY"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function WalletCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-4xl font-black text-[#53FC18]">
        {value}
      </h2>

      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  )
}