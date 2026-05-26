"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AvatarFrame from "@/components/profile/AvatarFrame"
import EquippedBadges from "@/components/profile/EquippedBadges"
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadBanner,
} from "@/services/profile.service"
import { getMyInventory, equipItem } from "@/services/economy.service"

interface Profile {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  banner_url?: string
  bio?: string
  gender?: string
  favorite_game?: string
  game_rank?: string
  preferred_role?: string
  region?: string
  online_status: boolean
  followers_count: number
  following_count: number
  average_rating: number
  total_ratings: number
  badges?: string[]
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    bio: "",
    gender: "",
    favorite_game: "",
    game_rank: "",
    preferred_role: "",
    region: "",
  })

  const equippedAvatarBorder = inventory.find(
    (item) => item.is_equipped && item.shop_items?.type === "avatar_border"
  )?.shop_items

  const equippedBadges = inventory
    .filter((item) => item.is_equipped && item.shop_items?.type === "badge")
    .map((item) => item.shop_items)

  async function loadProfile() {
    try {
      setLoading(true)
      setMessage("")

      const [profileData, inventoryData] = await Promise.all([
        getMyProfile(),
        getMyInventory(),
      ])

      setProfile(profileData)
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])

      setForm({
        username: profileData?.username || "",
        display_name: profileData?.display_name || "",
        bio: profileData?.bio || "",
        gender: profileData?.gender || "",
        favorite_game: profileData?.favorite_game || "",
        game_rank: profileData?.game_rank || "",
        preferred_role: profileData?.preferred_role || "",
        region: profileData?.region || "",
      })
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal mengambil profile")
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function reloadInventoryOnly() {
    const inventoryData = await getMyInventory()
    setInventory(Array.isArray(inventoryData) ? inventoryData : [])
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage("")

      const res = await updateMyProfile(form)

      const updatedProfile = res.profile || res
      setProfile(updatedProfile)

      setForm({
        username: updatedProfile?.username || "",
        display_name: updatedProfile?.display_name || "",
        bio: updatedProfile?.bio || "",
        gender: updatedProfile?.gender || "",
        favorite_game: updatedProfile?.favorite_game || "",
        game_rank: updatedProfile?.game_rank || "",
        preferred_role: updatedProfile?.preferred_role || "",
        region: updatedProfile?.region || "",
      })

      setMessage("Profile berhasil diperbarui")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal update profile")
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingAvatar(true)
      setMessage("")

      const res = await uploadAvatar(file)
      const updatedProfile = res.profile || res

      setProfile(updatedProfile)
      setMessage("Avatar berhasil diupload")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Upload avatar gagal")
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadingBanner(true)
      setMessage("")

      const res = await uploadBanner(file)
      const updatedProfile = res.profile || res

      setProfile(updatedProfile)
      setMessage("Banner berhasil diupload")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Upload banner gagal")
    } finally {
      setUploadingBanner(false)
    }
  }

  async function handleEquipInventory(inventoryId: string) {
    try {
      setMessage("")

      await equipItem(inventoryId)
      await reloadInventoryOnly()

      setMessage("Item berhasil diperbarui")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Gagal memakai item")
    }
  }

  function updateField(name: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
          <Sidebar />

          <section className="flex flex-1 items-center justify-center">
            <p className="animate-pulse font-black text-[#53FC18]">
              LOADING PROFILE...
            </p>
          </section>
        </main>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex-1 overflow-y-auto">
          <div className="relative h-[320px] overflow-hidden border-b-4 border-black bg-[#191B1F]">
            {profile?.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Banner"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-widest text-zinc-700">
                [ NO CUSTOM BANNER ]
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] to-transparent opacity-80" />

            <label className="absolute bottom-6 right-8 cursor-pointer border-2 border-black bg-[#0B0E11] px-5 py-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#191B1F]">
              {uploadingBanner ? "UPLOADING..." : "CHANGE BANNER"}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleBannerChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="relative px-6 pb-16 lg:px-10">
            <div className="-mt-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
                <div className="relative inline-block self-start">
                  <AvatarFrame
                    avatarUrl={profile?.avatar_url}
                    username={profile?.username || "M"}
                    border={equippedAvatarBorder}
                    size="large"
                  />

                  <div
                    className={`absolute -bottom-1 -right-1 h-6 w-6 border-4 border-black ${
                      profile?.online_status ? "bg-[#53FC18]" : "bg-zinc-600"
                    }`}
                  />

                  <label className="absolute -bottom-8 left-1/2 z-20 -translate-x-1/2 cursor-pointer whitespace-nowrap border-2 border-black bg-black px-4 py-2 text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition hover:text-[#53FC18]">
                    {uploadingAvatar ? "UPLOADING..." : "EDIT PHOTO"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-4 lg:pt-0">
                  <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
                    {profile?.online_status ? "ONLINE NOW" : "OFFLINE"}
                  </div>

                  <h1 className="text-5xl font-black uppercase tracking-tight text-white">
                    {profile?.display_name || profile?.username}
                  </h1>

                  <p className="mt-1 text-sm font-bold text-zinc-500">
                    @{profile?.username}
                  </p>

                  <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-400">
                    {profile?.bio ||
                      "Lengkapi bio kamu supaya player lain makin yakin ngajak mabar."}
                  </p>

                  {equippedAvatarBorder && (
                    <div className="mt-4 inline-flex border-2 border-black bg-[#191B1F] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                      BORDER ACTIVE: {equippedAvatarBorder.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className="mt-12 border-2 border-black bg-[#191B1F] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                📢 {message}
              </div>
            )}

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Stat label="FOLLOWERS" value={profile?.followers_count || 0} />
              <Stat label="FOLLOWING" value={profile?.following_count || 0} />
              <Stat label="RATING" value={`⭐ ${profile?.average_rating || 0}`} />
              <Stat label="REVIEWS" value={profile?.total_ratings || 0} />
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-3">
              <form
                onSubmit={handleSave}
                className="border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] xl:col-span-2"
              >
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  EDIT PROFILE
                </h2>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <Input
                    label="USERNAME"
                    value={form.username}
                    onChange={(value) => updateField("username", value)}
                  />

                  <Input
                    label="DISPLAY NAME"
                    value={form.display_name}
                    onChange={(value) => updateField("display_name", value)}
                  />

                  <Select
                    label="GENDER"
                    value={form.gender}
                    onChange={(value) => updateField("gender", value)}
                    options={["", "Male", "Female", "Prefer not to say"]}
                  />

                  <Input
                    label="REGION / SERVER"
                    value={form.region}
                    onChange={(value) => updateField("region", value)}
                    placeholder="INDONESIA"
                  />

                  <Select
                    label="FAVORITE GAME"
                    value={form.favorite_game}
                    onChange={(value) => updateField("favorite_game", value)}
                    options={[
                      "",
                      "Mobile Legends",
                      "Valorant",
                      "PUBG Mobile",
                      "Free Fire",
                      "Dota 2",
                    ]}
                  />

                  <Input
                    label="GAME RANK"
                    value={form.game_rank}
                    onChange={(value) => updateField("game_rank", value)}
                    placeholder="MYTHIC"
                  />

                  <Select
                    label="PREFERRED ROLE"
                    value={form.preferred_role}
                    onChange={(value) => updateField("preferred_role", value)}
                    options={[
                      "",
                      "Jungler",
                      "Roamer",
                      "Mid Lane",
                      "Gold Lane",
                      "EXP Lane",
                      "Duelist",
                      "Sentinel",
                      "Support",
                    ]}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
                      BIO
                    </label>

                    <textarea
                      value={form.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="CERITAKAN GAYA BERMAIN KAMU..."
                      className="min-h-32 w-full border-2 border-black bg-[#191B1F] px-5 py-4 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>
                </div>

                <button
                  disabled={saving}
                  className="mt-8 border-2 border-black bg-[#53FC18] px-8 py-4 text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE PROFILE"}
                </button>
              </form>

              <div className="space-y-6">
                <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">
                    CURRENT GAMER INFO
                  </h2>

                  <div className="mt-6 space-y-4">
                    <Info label="GAME" value={profile?.favorite_game} />
                    <Info label="RANK" value={profile?.game_rank} />
                    <Info label="ROLE" value={profile?.preferred_role} />
                    <Info label="REGION" value={profile?.region} />
                  </div>
                </div>

                <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">
                    EQUIPPED BADGES
                  </h2>

                  <div className="mt-6">
                    <EquippedBadges badges={equippedBadges} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                INVENTORY COSMETICS
              </h2>

              <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                Avatar border hanya 1 yang aktif. Badge bisa dipakai banyak, maksimal 5.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {inventory.length === 0 ? (
                  <div className="border-2 border-dashed border-black bg-[#191B1F] p-6 text-xs font-black uppercase text-zinc-500">
                    BELUM ADA ITEM. BELI DULU DI SHOP.
                  </div>
                ) : (
                  inventory.map((item) => {
                    const shopItem = item.shop_items
                    const isBorder = shopItem?.type === "avatar_border"
                    const isBadge = shopItem?.type === "badge"

                    return (
                      <div
                        key={item.id}
                        className="border-2 border-black bg-[#191B1F] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black uppercase text-[#53FC18]">
                              {shopItem?.name}
                            </p>

                            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              {shopItem?.type} • {shopItem?.rarity || "COMMON"}
                            </p>
                          </div>

                          {item.is_equipped && (
                            <span className="border border-black bg-yellow-400 px-2 py-1 text-[9px] font-black uppercase text-black">
                              EQUIPPED
                            </span>
                          )}
                        </div>

                        <div className="mt-5 flex min-h-32 items-center justify-center border-2 border-black bg-[#0B0E11] p-4">
                          {isBorder ? (
                            <AvatarFrame
                              avatarUrl={profile?.avatar_url}
                              username={profile?.username || "M"}
                              border={shopItem}
                              size="large"
                            />
                          ) : isBadge ? (
                            <EquippedBadges badges={[shopItem]} />
                          ) : shopItem?.image_url ? (
                            <img
                              src={shopItem.image_url}
                              alt={shopItem.name}
                              className="h-28 w-full object-contain"
                            />
                          ) : (
                            <p className="text-xs font-black uppercase text-zinc-600">
                              NO PREVIEW
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleEquipInventory(item.id)}
                          className={`mt-5 w-full border-2 border-black py-3 text-xs font-black uppercase text-black ${
                            item.is_equipped ? "bg-yellow-400" : "bg-[#53FC18]"
                          }`}
                        >
                          {item.is_equipped
                            ? isBadge
                              ? "LEPAS BADGE"
                              : "SEDANG DIPAKAI"
                            : isBorder
                              ? "PAKAI BORDER"
                              : isBadge
                                ? "PAKAI BADGE"
                                : "PAKAI ITEM"}
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-4xl font-black tracking-tight text-[#53FC18]">
        {value}
      </h2>

      <p className="mt-2 text-xs font-black uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder?.toUpperCase()}
        className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18]"
      />
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18]"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#0B0E11] font-bold text-white"
          >
            {option.toUpperCase() || "SELECT OPTION"}
          </option>
        ))}
      </select>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-black bg-[#191B1F] p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-black uppercase text-white">
        {value || "-"}
      </p>
    </div>
  )
}