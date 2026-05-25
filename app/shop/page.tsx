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
      setItems(Array.isArray(shopData) ? shopData : [])
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
      setProfile(profileData)
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil shop")
    } finally {
      setLoading(false)
    }
  }

  function getOwnedInventory(itemId: string) {
    return inventory.find((inv) => inv.shop_items?.id === itemId)
  }

  function isOwned(itemId: string) {
    return Boolean(getOwnedInventory(itemId))
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
              Beli item cosmetic pakai point. Border PNG transparan akan tampil langsung dari Supabase.
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

            <button
              onClick={() => {
                setType("")
                loadData("")
              }}
              className={`border-2 border-black text-xs font-black uppercase ${
                type === ""
                  ? "bg-[#53FC18] text-black"
                  : "bg-[#191B1F] text-[#53FC18]"
              }`}
            >
              All Items
            </button>

            <button
              onClick={() => {
                setType("avatar_border")
                loadData("avatar_border")
              }}
              className={`border-2 border-black text-xs font-black uppercase ${
                type === "avatar_border"
                  ? "bg-[#53FC18] text-black"
                  : "bg-[#191B1F] text-[#53FC18]"
              }`}
            >
              Avatar Border
            </button>

            <button
              onClick={() => {
                setType("badge")
                loadData("badge")
              }}
              className={`border-2 border-black text-xs font-black uppercase ${
                type === "badge"
                  ? "bg-[#53FC18] text-black"
                  : "bg-[#191B1F] text-[#53FC18]"
              }`}
            >
              Badge
            </button>
          </div>

          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black uppercase">
              Shop Items
            </h2>

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
                      className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
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
                              disabled={ownedInventory.is_equipped}
                              className="border-2 border-black bg-[#53FC18] px-5 py-3 text-xs font-black uppercase text-black disabled:bg-yellow-400"
                            >
                              {ownedInventory.is_equipped ? "Equipped" : "Equip"}
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
            <h2 className="mb-6 text-2xl font-black uppercase">
              My Inventory
            </h2>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {inventory.length === 0 ? (
                <div className="border-2 border-dashed border-black bg-[#0E1318] p-8 text-xs font-black uppercase text-zinc-500">
                  Inventory masih kosong.
                </div>
              ) : (
                inventory.map((inv) => {
                  const item = inv.shop_items

                  return (
                    <div
                      key={inv.id}
                      className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <ItemPreview
                        item={item}
                        avatarUrl={profile?.avatar_url}
                        username={profile?.username || "M"}
                      />

                      <h3 className="mt-5 text-xl font-black uppercase">
                        {item?.name}
                      </h3>

                      <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                        {item?.type} • {item?.rarity}
                      </p>

                      <button
                        onClick={() => handleEquip(inv.id)}
                        disabled={inv.is_equipped}
                        className="mt-5 w-full border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black disabled:bg-yellow-400"
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

function ItemPreview({
  item,
  avatarUrl,
  username,
}: {
  item: any
  avatarUrl?: string
  username: string
}) {
  const type = item?.type

  if (type === "avatar_border") {
    return (
      <div className="flex h-56 items-center justify-center border-2 border-black bg-[#191B1F] p-5">
        <AvatarFrame
          avatarUrl={avatarUrl}
          username={username}
          border={item}
          size="shop"
        />
      </div>
    )
  }

  if (type === "badge") {
    return (
      <div className="flex h-56 items-center justify-center border-2 border-black bg-[#191B1F] p-5">
        <EquippedBadges badges={[item]} />
      </div>
    )
  }

  if (item?.image_url) {
    return (
      <div className="flex h-56 items-center justify-center border-2 border-black bg-[#191B1F] p-5">
        <img
          src={item.image_url}
          alt={item.name}
          className="h-full w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex h-56 items-center justify-center border-2 border-black bg-[#191B1F] text-xs font-black uppercase text-zinc-500">
      Item Preview
    </div>
  )
}