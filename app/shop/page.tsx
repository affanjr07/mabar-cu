"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AvatarFrame from "@/components/profile/AvatarFrame"
import EquippedBadges from "@/components/profile/EquippedBadges"
import { getMyProfile } from "@/services/profile.service"
import {
  buyShopItem,
  equipItem,
  getMyInventory,
  getMyWallet,
  getShopItems,
} from "@/services/economy.service"

function parseMetadata(metadata: any) {
  if (!metadata) return {}

  if (typeof metadata === "object") return metadata

  try {
    return JSON.parse(metadata)
  } catch {
    return {}
  }
}

function getRarityClass(rarity?: string) {
  switch (rarity) {
    case "mythic":
      return "border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.45)]"

    case "legendary":
      return "border-orange-400 shadow-[0_0_25px_rgba(251,146,60,0.35)]"

    case "epic":
      return "border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.35)]"

    case "elite":
      return "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.35)]"

    case "rare":
      return "border-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.35)]"

    default:
      return "border-zinc-500"
  }
}

export default function ShopPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [type, setType] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)

  async function loadData(itemType = type) {
    try {
      setLoading(true)

      const [walletData, shopData, inventoryData, profileData] =
        await Promise.all([
          getMyWallet(),
          getShopItems(itemType || undefined),
          getMyInventory(),
          getMyProfile(),
        ])

      setWallet(walletData?.wallet || walletData)
      setItems(Array.isArray(shopData) ? shopData : shopData?.items || [])
      setInventory(
        Array.isArray(inventoryData)
          ? inventoryData
          : inventoryData?.inventory || []
      )
      setProfile(profileData?.profile || profileData)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil shop")
    } finally {
      setLoading(false)
    }
  }

  function getOwnedInventory(itemId: string) {
    return inventory.find((inv) => inv.shop_items?.id === itemId)
  }

  async function handleBuy(itemId: string) {
    try {
      setMessage("")
      await buyShopItem(itemId)
      setMessage("Item berhasil dibeli.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal membeli item")
    }
  }

  async function handleEquip(inventoryId: string) {
    try {
      setMessage("")
      await equipItem(inventoryId)
      setMessage("Item berhasil dipakai.")
      await loadData()
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal equip item")
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
          <div className="border-2 border-black bg-[#0E1318] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
              // MABAR SHOP
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight">
              Avatar Border & Badge
            </h1>

            <p className="mt-3 text-xs font-bold uppercase text-zinc-500">
              Badge sekarang bisa tampil gambar dari Supabase dan label animasi dari metadata.
            </p>
          </div>

          {message && (
            <div className="mt-8 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {message}
            </div>
          )}

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <div className="border-2 border-black bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase text-zinc-500">
                Balance
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#53FC18]">
                {wallet?.balance || 0}
              </h2>
            </div>

            <FilterButton active={type === ""} onClick={() => {
              setType("")
              loadData("")
            }}>
              All Items
            </FilterButton>

            <FilterButton active={type === "avatar_border"} onClick={() => {
              setType("avatar_border")
              loadData("avatar_border")
            }}>
              Avatar Border
            </FilterButton>

            <FilterButton active={type === "badge"} onClick={() => {
              setType("badge")
              loadData("badge")
            }}>
              Badge
            </FilterButton>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black uppercase">Shop Items</h2>

            {loading ? (
              <div className="border-2 border-black bg-[#0E1318] p-8 text-xs font-black uppercase text-zinc-500">
                Loading shop...
              </div>
            ) : items.length === 0 ? (
              <div className="border-2 border-dashed border-black bg-[#0E1318] p-8 text-xs font-black uppercase text-zinc-500">
                Item belum tersedia.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const ownedInventory = getOwnedInventory(item.id)
                  const owned = Boolean(ownedInventory)

                  return (
                    <div
                      key={item.id}
                      className={`border-2 bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] ${getRarityClass(item.rarity)}`}
                    >
                      <ItemPreview
                        item={item}
                        avatarUrl={profile?.avatar_url}
                        username={profile?.username || "M"}
                      />

                      <div className="mt-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                          {item.type} • {item.rarity}
                        </p>

                        <h3 className="mt-2 text-xl font-black uppercase">
                          {item.name}
                        </h3>

                        <p className="mt-2 min-h-10 text-xs font-bold uppercase text-zinc-500">
                          {item.description || "Cosmetic item MABAR.CU"}
                        </p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <span className="text-2xl font-black text-[#53FC18]">
                            {item.price}
                          </span>

                          {owned ? (
                            <button
                              onClick={() => handleEquip(ownedInventory.id)}
                              className={`border-2 border-black px-5 py-3 text-xs font-black uppercase text-black ${
                                ownedInventory.is_equipped
                                  ? "bg-yellow-400"
                                  : "bg-[#53FC18]"
                              }`}
                            >
                              {ownedInventory.is_equipped
                                ? "Equipped"
                                : item.type === "avatar_border"
                                  ? "Use Border"
                                  : "Equip"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuy(item.id)}
                              className="border-2 border-black bg-[#53FC18] px-5 py-3 text-xs font-black uppercase text-black"
                            >
                              Buy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-black uppercase">My Inventory</h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {inventory.length === 0 ? (
                <div className="border-2 border-dashed border-black bg-[#0E1318] p-8 text-xs font-black uppercase text-zinc-500">
                  Inventory masih kosong.
                </div>
              ) : (
                inventory.map((inv) => {
                  const item = inv.shop_items
                  if (!item) return null

                  return (
                    <div
                      key={inv.id}
                      className={`border-2 bg-[#0E1318] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${getRarityClass(item.rarity)}`}
                    >
                      <ItemPreview
                        item={item}
                        avatarUrl={profile?.avatar_url}
                        username={profile?.username || "M"}
                      />

                      <h3 className="mt-4 text-lg font-black uppercase">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        {item.type} • {item.rarity}
                      </p>

                      <button
                        onClick={() => handleEquip(inv.id)}
                        className={`mt-4 w-full border-2 border-black py-3 text-xs font-black uppercase text-black ${
                          inv.is_equipped ? "bg-yellow-400" : "bg-[#53FC18]"
                        }`}
                      >
                        {inv.is_equipped ? "Equipped" : "Equip"}
                      </button>
                    </div>
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

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`border-2 border-black text-xs font-black uppercase ${
        active ? "bg-[#53FC18] text-black" : "bg-[#191B1F] text-[#53FC18]"
      }`}
    >
      {children}
    </button>
  )
}

function ItemPreview({
  item,
  avatarUrl,
  username,
}: {
  item: any
  avatarUrl?: string
  username: string
}) {
  if (item.type === "avatar_border") {
    return (
      <div className="flex h-36 items-center justify-center border-2 border-black bg-[#191B1F]">
        <AvatarFrame
          avatarUrl={avatarUrl}
          username={username}
          border={item}
          size="shop"
        />
      </div>
    )
  }

  if (item.type === "badge") {
    return (
      <div className="flex h-36 items-center justify-center border-2 border-black bg-[#191B1F]">
        <AnimatedBadge item={item} />
      </div>
    )
  }

  return (
    <div className="flex h-36 items-center justify-center border-2 border-black bg-[#191B1F] text-xs font-black uppercase text-zinc-600">
      No Preview
    </div>
  )
}

function AnimatedBadge({ item }: { item: any }) {
  const metadata = parseMetadata(item.metadata)
  const label = metadata.label || item.name
  const isMythic = item.rarity === "mythic"

  return (
    <div className="relative flex flex-col items-center gap-3">
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className={`h-20 w-20 object-contain ${
            metadata.animation === "pulse" || metadata.glow || isMythic
              ? "animate-pulse"
              : ""
          }`}
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center border-2 border-black bg-yellow-400 text-xl font-black text-black">
          ★
        </div>
      )}

      <div
        className={`border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
          isMythic
            ? "bg-yellow-400 text-black shadow-[0_0_18px_rgba(250,204,21,0.8)] animate-pulse"
            : "bg-[#53FC18] text-black"
        }`}
      >
        {label}
      </div>
    </div>
  )
}