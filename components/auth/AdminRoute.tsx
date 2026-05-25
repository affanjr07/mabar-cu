"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export default function AdminRoute({
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

    if (user?.role !== "admin") {
      router.replace("/dashboard")
    }
  }, [hasHydrated, isAuthenticated, user, router])

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-green-400">
        Loading admin session...
      </main>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-red-400">
        Access denied...
      </main>
    )
  }

  return <>{children}</>
}