export default function EquippedBadges({ badges = [] }: { badges: any[] }) {
  if (!badges.length) {
    return (
      <p className="text-xs font-bold uppercase text-zinc-600">
        BELUM MEMAKAI BADGE.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={`border border-black px-3 py-1.5 text-xs font-black uppercase tracking-wider ${
            badge.css_class || "bg-[#53FC18]/10 text-[#53FC18]"
          }`}
          style={{
            background: badge.metadata?.background,
            color: badge.metadata?.color,
          }}
        >
          {badge.metadata?.label || badge.name}
        </span>
      ))}
    </div>
  )
}