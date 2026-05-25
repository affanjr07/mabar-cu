import { create } from "zustand"

interface AuthUser {
  id: string
  email: string
  role: "user" | "admin" | "pro_player"
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setAuth: (user: AuthUser, token: string) => void
  loadAuthFromStorage: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hasHydrated: false,

  setAuth: (user, token) => {
    localStorage.setItem("mabar_token", token)
    localStorage.setItem("mabar_user", JSON.stringify(user))

    set({
      user,
      token,
      isAuthenticated: true,
      hasHydrated: true,
    })
  },

  loadAuthFromStorage: () => {
    const token = localStorage.getItem("mabar_token")
    const user = localStorage.getItem("mabar_user")

    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
        hasHydrated: true,
      })

      return
    }

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: true,
    })
  },

  logout: () => {
    localStorage.removeItem("mabar_token")
    localStorage.removeItem("mabar_user")

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: true,
    })
  },
}))