"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function ProPlayerRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!hasHydrated) return

    if (!isAuthenticated) {
      router.replace("/login")
      return
    }

    if (user?.role !== "pro_player" && user?.role !== "admin") {
      router.replace("/pro")
    }
  }, [hasHydrated, isAuthenticated, user, router])

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-[#53FC18]">
        Loading pro session...
      </main>
    )
  }

  if (!isAuthenticated || (user?.role !== "pro_player" && user?.role !== "admin")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-red-400">
        Access denied...
      </main>
    )
  }

  return <>{children}</>
}