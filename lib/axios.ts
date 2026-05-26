import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
})

function getTokenFromStorage() {
  if (typeof window === "undefined") return null

  const mabarToken = localStorage.getItem("mabar_token")
  if (mabarToken) return mabarToken

  const token = localStorage.getItem("token")
  if (token) return token

  const authStorage = localStorage.getItem("auth-storage")
  if (!authStorage) return null

  try {
    const parsed = JSON.parse(authStorage)

    return (
      parsed?.state?.token ||
      parsed?.state?.accessToken ||
      parsed?.token ||
      parsed?.accessToken ||
      null
    )
  } catch {
    return null
  }
}

api.interceptors.request.use((config) => {
  const token = getTokenFromStorage()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const data = error.response?.data

      // interceptor mendeteksi user terkena banned saat beraktivitas
      if (data?.code === "USER_BANNED") {
        // Bersihkan seluruh sesi penyimpanan lokal
        localStorage.removeItem("mabar_token")
        localStorage.removeItem("token")
        localStorage.removeItem("auth-storage")

        const reason = encodeURIComponent(data.reason || "MELANGGAR ATURAN PLATFORM")
        const until = data.banned_until ? encodeURIComponent(data.banned_until) : "PERMANEN"

        // Alihkan langsung ke login menggunakan query params agar ditangkap oleh embed UI LoginPage
        window.location.href = `/login?error=USER_BANNED&reason=${reason}&until=${until}`
      }
    }

    return Promise.reject(error)
  }
)