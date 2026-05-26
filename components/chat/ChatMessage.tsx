"use client"

import { motion } from "framer-motion"

interface ChatMessageProps {
  mine?: boolean
  username: string
  message: string
  timestamp?: string // Opsional: contoh "18:24" atau "02:15 PM"
}

export default function ChatMessage({
  mine,
  username,
  message,
  timestamp = "NOW",
}: ChatMessageProps) {
  // Mengambil inisial nama untuk Avatar Kotak (Contoh: "HeroicPlayer" -> "HE")
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "??"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex w-full font-mono items-end gap-3 ${
        mine ? "justify-end pl-12" : "justify-start pr-12"
      }`}
    >
      {/* AVATAR KOTAK UNTUK PESAN DARI ORANG LAIN */}
      {!mine && (
        <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-[#191B1F] text-[11px] font-black text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {getInitials(username)}
        </div>
      )}

      {/* BUBBLE CHAT UTAMA */}
      <div
        className={`max-w-md w-full border-2 border-black p-4 text-left select-text transition-all duration-150 hover:-translate-y-[1px] ${
          mine
            ? "bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            : "bg-[#0E1318] text-white shadow-[4px_4px_0px_0px_#191B1F] hover:shadow-[5px_5px_0px_0px_#191B1F]"
        }`}
      >
        {/* HEADER BUBBLE: USERNAME & IDENTIFIER */}
        <div className="mb-2 flex items-center justify-between border-b border-black/10 pb-1.5 text-[10px] font-black uppercase tracking-wider">
          <span className={mine ? "text-black/70" : "text-[#53FC18]"}>
            {mine ? "YOU" : username}
          </span>
          <span className={mine ? "text-black/40" : "text-zinc-500"}>
            {mine ? "// OUTGOING" : "// INCOMING"}
          </span>
        </div>

        {/* ISI PESAN TEXT */}
        <p className="text-xs font-bold uppercase tracking-tight leading-relaxed break-words whitespace-pre-wrap">
          {message}
        </p>

        {/* TIMESTAMP DI POJOK BAWAH KOTAK CHAT */}
        <div
          className={`mt-2 flex justify-end text-[9px] font-black tracking-widest ${
            mine ? "text-black/40" : "text-zinc-600"
          }`}
        >
          [{timestamp}]
        </div>
      </div>

      {/* AVATAR KOTAK UNTUK PESAN KITA SENDIRI */}
      {mine && (
        <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-[#53FC18] text-[11px] font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ME
        </div>
      )}
    </motion.div>
  )
}