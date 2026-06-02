"use client"

import { useEffect, useState } from "react"
import Sidebar from "@/components/layout/Sidebar"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import AvatarFrame from "@/components/profile/AvatarFrame"
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadBanner,
} from "@/services/profile.service"
import { getMyInventory, equipItem } from "@/services/economy.service"
import MabarLoading from "@/components/ui/MabarLoading"

interface ShopItem {
  id: string
  name: string
  type: string
  image_url?: string | null
  rarity?: string
  css_class?: string | null
  metadata?: any
}

interface InventoryItem {
  id: string
  is_equipped: boolean
  shop_items?: ShopItem
}

interface Profile {
  id: string
  username: string
  display_name?: string
  avatar_url?: string | null
  banner_url?: string | null
  bio?: string | null
  gender?: string | null
  favorite_game?: string | null
  game_rank?: string | null
  preferred_role?: string | null
  region?: string | null
  online_status?: boolean
  followers_count?: number
  following_count?: number
  average_rating?: number
  total_ratings?: number
}

const BANNER_WIDTH = 1600
const BANNER_HEIGHT = 500

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [message, setMessage] = useState("")

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("")
  const [showBannerPreview, setShowBannerPreview] = useState(false)
  const [bannerZoom, setBannerZoom] = useState(1)
  const [bannerX, setBannerX] = useState(0)
  const [bannerY, setBannerY] = useState(0)

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
    .filter(Boolean) as ShopItem[]

  async function loadProfile() {
    try {
      setLoading(true)
      setMessage("")

      const [profileData, inventoryData] = await Promise.all([
        getMyProfile(),
        getMyInventory(),
      ])

      const finalProfile = profileData?.profile || profileData
      const finalInventory = Array.isArray(inventoryData)
        ? inventoryData
        : inventoryData?.inventory || []

      setProfile(finalProfile)
      setInventory(finalInventory)

      setForm({
        username: finalProfile?.username || "",
        display_name: finalProfile?.display_name || "",
        bio: finalProfile?.bio || "",
        gender: finalProfile?.gender || "",
        favorite_game: finalProfile?.favorite_game || "",
        game_rank: finalProfile?.game_rank || "",
        preferred_role: finalProfile?.preferred_role || "",
        region: finalProfile?.region || "",
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
    const finalInventory = Array.isArray(inventoryData)
      ? inventoryData
      : inventoryData?.inventory || []

    setInventory(finalInventory)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage("")

      const res = await updateMyProfile(form)
      const updatedProfile = res.profile || res

      setProfile(updatedProfile)
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

      setProfile((prev) => ({
        ...(prev as Profile),
        ...updatedProfile,
      }))

      setMessage("Avatar berhasil diupload")
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Upload avatar gagal")
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  function handleBannerSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)

    const previewUrl = URL.createObjectURL(file)

    setBannerFile(file)
    setBannerPreviewUrl(previewUrl)
    setBannerZoom(1)
    setBannerX(0)
    setBannerY(0)
    setShowBannerPreview(true)

    e.target.value = ""
  }

  function closeBannerPreview() {
    if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)

    setBannerFile(null)
    setBannerPreviewUrl("")
    setShowBannerPreview(false)
    setBannerZoom(1)
    setBannerX(0)
    setBannerY(0)
  }

  async function createAdjustedBannerFile() {
    if (!bannerFile || !bannerPreviewUrl) throw new Error("File banner kosong")

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = bannerPreviewUrl
    })

    const canvas = document.createElement("canvas")
    canvas.width = BANNER_WIDTH
    canvas.height = BANNER_HEIGHT

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas tidak tersedia")

    ctx.fillStyle = "#0B0E11"
    ctx.fillRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT)

    const imageRatio = image.width / image.height
    const bannerRatio = BANNER_WIDTH / BANNER_HEIGHT

    let bgWidth = BANNER_WIDTH
    let bgHeight = BANNER_HEIGHT

    if (imageRatio > bannerRatio) {
      bgHeight = BANNER_HEIGHT
      bgWidth = bgHeight * imageRatio
    } else {
      bgWidth = BANNER_WIDTH
      bgHeight = bgWidth / imageRatio
    }

    ctx.globalAlpha = 0.35
    ctx.filter = "blur(18px)"
    ctx.drawImage(
      image,
      (BANNER_WIDTH - bgWidth) / 2,
      (BANNER_HEIGHT - bgHeight) / 2,
      bgWidth,
      bgHeight
    )

    ctx.globalAlpha = 1
    ctx.filter = "none"

    let drawWidth = BANNER_WIDTH
    let drawHeight = BANNER_HEIGHT

    if (imageRatio > bannerRatio) {
      drawWidth = BANNER_WIDTH
      drawHeight = drawWidth / imageRatio
    } else {
      drawHeight = BANNER_HEIGHT
      drawWidth = drawHeight * imageRatio
    }

    drawWidth *= bannerZoom
    drawHeight *= bannerZoom

    const moveX = (bannerX / 100) * BANNER_WIDTH
    const moveY = (bannerY / 100) * BANNER_HEIGHT

    ctx.drawImage(
      image,
      (BANNER_WIDTH - drawWidth) / 2 + moveX,
      (BANNER_HEIGHT - drawHeight) / 2 + moveY,
      drawWidth,
      drawHeight
    )

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) reject(new Error("Gagal membuat banner"))
          else resolve(result)
        },
        "image/webp",
        0.92
      )
    })

    return new File([blob], `banner-${Date.now()}.webp`, {
      type: "image/webp",
    })
  }

  async function handleConfirmBannerUpload() {
    try {
      setUploadingBanner(true)
      setMessage("")

      const adjustedFile = await createAdjustedBannerFile()
      const res = await uploadBanner(adjustedFile)
      const updatedProfile = res.profile || res

      setProfile((prev) => ({
        ...(prev as Profile),
        ...updatedProfile,
      }))

      setMessage("Banner berhasil diupload")
      closeBannerPreview()
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

    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl)
    }
  }, [])

if (loading) {
  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        <section className="flex flex-1 items-center justify-center">
          <MabarLoading mode="section" />
        </section>
      </main>
    </ProtectedRoute>
  )
}

  return (
    <ProtectedRoute>
      <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white">
        <Sidebar />

        {showBannerPreview && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6">
            <div className="custom-scrollbar max-h-[95vh] w-full max-w-5xl overflow-y-auto border-4 border-black bg-[#0E1318] p-4 shadow-[6px_6px_0px_0px_rgba(83,252,24,1)] sm:p-6">
              <div className="flex flex-col justify-between gap-4 border-b-2 border-[#191B1F] pb-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
                    Preview Banner
                  </h2>

                  <p className="mt-1 text-[10px] font-bold uppercase text-zinc-500 sm:text-xs">
                    Atur zoom dan posisi sebelum upload.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBannerPreview}
                  className="border-2 border-black bg-red-600 px-5 py-3 text-xs font-black uppercase text-white"
                >
                  Batal
                </button>
              </div>

              <div className="mt-5 overflow-hidden border-4 border-black bg-[#191B1F]">
                <div className="relative aspect-[16/5] w-full overflow-hidden">
                  {bannerPreviewUrl && (
                    <>
                      <img
                        src={bannerPreviewUrl}
                        alt="Banner Blur Background"
                        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-lg"
                      />

                      <img
                        src={bannerPreviewUrl}
                        alt="Banner Preview"
                        className="absolute left-1/2 top-1/2 max-h-none max-w-none object-contain"
                        style={{
                          width: `${100 * bannerZoom}%`,
                          transform: `translate(calc(-50% + ${bannerX}px), calc(-50% + ${bannerY}px))`,
                        }}
                      />
                    </>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  <div className="absolute left-3 top-3 border-2 border-black bg-[#53FC18] px-2 py-1 text-[9px] font-black uppercase text-black sm:left-5 sm:top-5 sm:px-3">
                    Banner Preview
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <ControlRange
                  label="Zoom"
                  min={0.45}
                  max={2.5}
                  step={0.05}
                  value={bannerZoom}
                  onChange={setBannerZoom}
                />

                <ControlRange
                  label="Kiri / Kanan"
                  min={-220}
                  max={220}
                  step={1}
                  value={bannerX}
                  onChange={setBannerX}
                />

                <ControlRange
                  label="Atas / Bawah"
                  min={-160}
                  max={160}
                  step={1}
                  value={bannerY}
                  onChange={setBannerY}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setBannerZoom(1)
                    setBannerX(0)
                    setBannerY(0)
                  }}
                  className="border-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase text-white"
                >
                  Reset Posisi
                </button>

                <button
                  type="button"
                  disabled={uploadingBanner}
                  onClick={handleConfirmBannerUpload}
                  className="border-2 border-black bg-[#53FC18] py-3 text-xs font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {uploadingBanner ? "Uploading..." : "Upload Banner Ini"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="flex-1 overflow-y-auto">
          <div className="relative h-[320px] overflow-hidden border-b-4 border-black bg-[#191B1F]">
            {profile?.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Profile Banner"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-black uppercase tracking-widest text-zinc-700">
                [ NO CUSTOM BANNER ]
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E11] via-[#0B0E11]/60 to-black/20" />

            <label className="absolute bottom-6 right-8 z-20 cursor-pointer border-2 border-black bg-[#53FC18] px-5 py-3 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b]">
              CHANGE BANNER
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleBannerSelect}
                className="hidden"
                disabled={uploadingBanner}
              />
            </label>
          </div>

          <div className="relative px-6 pb-16 lg:px-10">
            <div className="-mt-24 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
                <div className="relative inline-block self-start">
                  <AvatarFrame
                    avatarUrl={profile?.avatar_url || undefined}
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
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                <div className="pt-4 lg:pt-0">
                  <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
                    {profile?.online_status ? "ONLINE NOW" : "OFFLINE"}
                  </div>

                  <h1 className="text-5xl font-black uppercase tracking-tight text-white">
                    {profile?.display_name || profile?.username || "PLAYER"}
                  </h1>

                  <p className="mt-1 text-sm font-bold text-[#53FC18]">
                    @{profile?.username}
                  </p>

                  <p className="mt-4 max-w-2xl text-xs font-bold uppercase leading-relaxed text-zinc-400">
                    {profile?.bio ||
                      "Lengkapi bio kamu supaya player lain makin yakin ngajak mabar."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {equippedAvatarBorder && (
                      <span className="border-2 border-black bg-[#191B1F] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                        BORDER ACTIVE: {equippedAvatarBorder.name}
                      </span>
                    )}

                    {equippedBadges.map((badge) => (
                      <BadgePreview key={badge.id} badge={badge} />
                    ))}
                  </div>
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

                  <Input
                    label="FAVORITE GAME"
                    value={form.favorite_game}
                    onChange={(value) => updateField("favorite_game", value)}
                    placeholder="MOBILE LEGENDS"
                  />

                  <Input
                    label="GAME RANK"
                    value={form.game_rank}
                    onChange={(value) => updateField("game_rank", value)}
                    placeholder="MYTHIC"
                  />

                  <Input
                    label="PREFERRED ROLE"
                    value={form.preferred_role}
                    onChange={(value) => updateField("preferred_role", value)}
                    placeholder="JUNGLER"
                  />

                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      BIO
                    </label>

                    <textarea
                      value={form.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      placeholder="CERITAKAN STYLE MAIN KAMU..."
                      className="mt-2 min-h-28 w-full border-2 border-black bg-[#191B1F] p-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
                    />
                  </div>
                </div>

                <button
                  disabled={saving}
                  className="mt-8 h-12 w-full border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE PROFILE"}
                </button>
              </form>

              <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  COSMETICS
                </h2>

                <p className="mt-2 text-xs font-bold uppercase text-zinc-500">
                  Pilih avatar border dan badge yang sudah kamu beli.
                </p>

                <div className="mt-6 space-y-4">
                  {inventory.length === 0 ? (
                    <p className="text-xs font-black uppercase text-zinc-600">
                      Inventory masih kosong.
                    </p>
                  ) : (
                    inventory.map((item) => {
                      const shopItem = item.shop_items
                      if (!shopItem) return null

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 border-2 border-black bg-[#191B1F] p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {shopItem.image_url ? (
                              <img
                                src={shopItem.image_url}
                                alt={shopItem.name}
                                className="h-10 w-10 object-contain"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center border border-black bg-[#0B0E11] text-xs font-black text-[#53FC18]">
                                ★
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-xs font-black uppercase text-white">
                                {shopItem.name}
                              </p>

                              <p className="text-[9px] font-black uppercase text-[#53FC18]">
                                {shopItem.type} • {shopItem.rarity || "common"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleEquipInventory(item.id)}
                            className={`border-2 border-black px-3 py-2 text-[10px] font-black uppercase ${
                              item.is_equipped
                                ? "bg-yellow-400 text-black"
                                : "bg-[#53FC18] text-black"
                            }`}
                          >
                            {item.is_equipped ? "EQUIPPED" : "EQUIP"}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  )
}

function ControlRange({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block border-2 border-black bg-[#191B1F] p-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}: {Number(value).toFixed(2)}
      </span>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#53FC18]"
      />
    </label>
  )
}

function BadgePreview({ badge }: { badge: ShopItem }) {
  return (
    <span className="inline-flex items-center gap-2 border-2 border-black bg-[#191B1F] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
      {badge.image_url && (
        <img
          src={badge.image_url}
          alt={badge.name}
          className="h-5 w-5 object-contain"
        />
      )}
      {badge.name}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-4xl font-black uppercase tracking-tight text-[#53FC18]">
        {value}
      </h2>

      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
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
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
      />
    </label>
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
    <label>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs font-bold uppercase text-white outline-none focus:border-[#53FC18]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option || "PILIH"}
          </option>
        ))}
      </select>
    </label>
  )
}