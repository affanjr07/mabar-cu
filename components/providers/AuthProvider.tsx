"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { socket } from "@/lib/socket"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const loadAuthFromStorage = useAuthStore(
    (state) => state.loadAuthFromStorage
  )

  useEffect(() => {
    loadAuthFromStorage()
  }, [loadAuthFromStorage])

  useEffect(() => {
    if (!user?.id) return

    if (!socket.connected) {
      socket.connect()
    }

    socket.emit("user_online", user.id)

    socket.on("force_logout", (data) => {
      const until = data.banned_until
        ? new Date(data.banned_until).toLocaleString("id-ID")
        : "Permanen"

      alert(
        `Akun kamu terkena ban.\nAlasan: ${
          data.reason || "Melanggar aturan platform"
        }\nSampai: ${until}`
      )

      socket.emit("user_offline", user.id)
      logout()
      router.push("/login")
    })

    socket.on("user_muted", (data) => {
      const until = data.muted_until
        ? new Date(data.muted_until).toLocaleString("id-ID")
        : "Permanen"

      alert(
        `Kamu terkena mute.\nAlasan: ${
          data.reason || "Melanggar aturan chat"
        }\nSampai: ${until}`
      )
    })

    return () => {
      socket.emit("user_offline", user.id)
      socket.off("force_logout")
      socket.off("user_muted")
    }
  }, [user?.id, logout, router])

  return <>{children}</>
}