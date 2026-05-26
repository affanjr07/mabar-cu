"use client"

interface AvatarFrameProps {
  avatarUrl?: string
  username: string
  border?: any
  size?: "small" | "medium" | "large" | "shop"
}
function getBorderEffect(border: any) {
  switch (border?.rarity) {
    case "mythic":
      return "animate-pulse drop-shadow-[0_0_15px_gold]"

    case "legendary":
      return "drop-shadow-[0_0_12px_orange]"

    case "epic":
      return "drop-shadow-[0_0_12px_purple]"

    case "elite":
      return "drop-shadow-[0_0_12px_lime]"

    case "rare":
      return "drop-shadow-[0_0_12px_deepskyblue]"

    default:
      return ""
  }
}

export default function AvatarFrame({
  avatarUrl,
  username,
  border,
  size = "medium",
}: AvatarFrameProps) {
  const boxSize =
    size === "small"
      ? "h-16 w-16"
      : size === "medium"
        ? "h-24 w-24"
        : size === "shop"
          ? "h-40 w-40"
          : "h-44 w-44"

  const avatarPadding =
    border?.metadata?.avatarPadding ??
    (size === "small" ? 9 : size === "shop" ? 28 : size === "large" ? 32 : 18)

  const avatarOffsetX = border?.metadata?.avatarOffsetX ?? 0
  const avatarOffsetY = border?.metadata?.avatarOffsetY ?? 0
  const avatarScale = border?.metadata?.avatarScale ?? 1

  return (
    <div className={`relative ${boxSize} shrink-0`}>
      {/* AVATAR */}
      <div
        className="absolute overflow-hidden bg-[#191B1F]"
        style={{
          left: `${avatarPadding + avatarOffsetX}px`,
          right: `${avatarPadding - avatarOffsetX}px`,
          top: `${avatarPadding + avatarOffsetY}px`,
          bottom: `${avatarPadding - avatarOffsetY}px`,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="h-full w-full object-cover"
            style={{
              transform: `scale(${avatarScale})`,
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black uppercase text-zinc-500">
            {username?.charAt(0)?.toUpperCase() || "M"}
          </div>
        )}
      </div>

      {/* PNG BORDER */}
      {border?.image_url ? (
        <img
          src={border.image_url}
          alt={border.name || "Avatar Border"}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 z-10 border-4 border-black" />
      )}
    </div>
  )
}