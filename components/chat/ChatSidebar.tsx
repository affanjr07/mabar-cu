const friends = [
  {
    name: "ShadowHunter",
    online: true,
  },
  {
    name: "Zenitsu",
    online: true,
  },
  {
    name: "Akashi",
    online: false,
  },
]

export default function ChatSidebar() {
  return (
    <aside className="hidden w-80 border-r-4 border-black bg-[#0E1318] font-mono text-white lg:block">

      {/* HEADER BRUTALIST */}
      <div className="border-b-4 border-black bg-[#0B0E11] p-6">
        <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          // CHAT_MODULE_v1.0
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-[#53FC18]">
          Messages
        </h1>
      </div>

      {/* FRIENDS LIST KOTAK */}
      <div className="divide-y-2 divide-black">
        {friends.map((friend) => (
          <button
            key={friend.name}
            className="flex w-full items-center gap-4 bg-[#0E1318] p-4 text-left transition-all hover:bg-black active:bg-neutral-950 group"
          >
            {/* AVATAR KOTAK KAKU */}
            <div className="relative shrink-0 border-2 border-black bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {/* Tempat Gambar Avatar */}
              <div className="h-12 w-12 flex items-center justify-center text-xs font-black text-zinc-500 uppercase bg-[#191B1F]">
                {friend.name.substring(0, 2)}
              </div>

              {/* INDIKATOR STATUS KOTAK */}
              <div
                className={`absolute -bottom-1 -right-1 border border-black px-1 text-[8px] font-black uppercase tracking-tighter text-black ${
                  friend.online
                    ? "bg-[#53FC18]"
                    : "bg-zinc-600 text-zinc-300"
                }`}
              >
                {friend.online ? "LN" : "OF"}
              </div>
            </div>

            {/* DETAIL DATA USER */}
            <div className="flex-1 min-w-0">
              <h2 className="font-black uppercase tracking-tight text-sm truncate group-hover:text-[#53FC18]">
                {friend.name}
              </h2>

              <div className="mt-1 flex items-center gap-1.5">
                {friend.online && (
                  <span className="h-1.5 w-1.5 animate-pulse bg-[#53FC18]"></span>
                )}
                <p className={`text-[10px] font-black uppercase tracking-wider ${
                  friend.online ? "text-[#53FC18]" : "text-zinc-500"
                }`}>
                  {friend.online ? "ONLINE // ACTIVE" : "OFFLINE"}
                </p>
              </div>
            </div>

            {/* DEKORASI BRUTALIST PANAH */}
            <div className="text-zinc-700 font-black text-xs pr-1 group-hover:text-white">
              &rarr;
            </div>
          </button>
        ))}
      </div>

    </aside>
  )
}