interface ChatMessageProps {
  mine?: boolean
  username: string
  message: string
}

export default function ChatMessage({
  mine,
  username,
  message,
}: ChatMessageProps) {
  return (
    <div
      className={`flex w-full font-mono ${
        mine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-md w-full border-2 border-black p-4 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
          mine
            ? "bg-[#53FC18] text-black"
            : "bg-[#191B1F] text-white"
        }`}
      >
        {/* HEADER BUBBLE: USERNAME & IDENTIFIER */}
        <div className="mb-2 flex items-center justify-between border-b border-black/20 pb-1.5 text-[10px] font-black uppercase tracking-wider">
          <span className={mine ? "text-black/70" : "text-[#53FC18]"}>
            {mine ? "YOU" : username}
          </span>
          <span className={mine ? "text-black/40" : "text-zinc-500"}>
            {mine ? "// OUTGOING" : "// INCOMING"}
          </span>
        </div>

        {/* ISI PESAN TEXT */}
        <p className="text-xs font-bold uppercase tracking-tight leading-relaxed break-words">
          {message}
        </p>
      </div>
    </div>
  )
}