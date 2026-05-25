"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth.store"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const loadAuthFromStorage = useAuthStore(
    (state) => state.loadAuthFromStorage
  )

  useEffect(() => {
    loadAuthFromStorage()
  }, [loadAuthFromStorage])

  return <>{children}</>
}