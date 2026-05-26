"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthLayout from "@/components/layout/AuthLayout"
import { loginUser } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { AlertTriangle, Eye, EyeOff } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isBanned, setIsBanned] = useState(false)
  const [banDetails, setBanDetails] = useState({ reason: "", until: "" })
  const [successMessage, setSuccessMessage] = useState("")

  function formatBanDate(date?: string) {
    if (!date || date === "PERMANEN") return "PERMANEN"

    try {
      return new Date(date).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    } catch {
      return date // Fallback jika format string tanggal sudah di-format sebelumnya
    }
  }

  // Efek untuk menangkap data banned otomatis dari URL (kiriman Axios interceptor)
  useEffect(() => {
    const errCode = searchParams.get("error")
    const reason = searchParams.get("reason")
    const until = searchParams.get("until")

    if (errCode === "USER_BANNED") {
      setIsBanned(true)
      setBanDetails({
        reason: reason || "MELANGGAR ATURAN PLATFORM",
        until: until === "PERMANEN" ? "PERMANEN" : formatBanDate(until || ""),
      })
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError("")
      setIsBanned(false)
      setSuccessMessage("")

      const data = await loginUser({
        email,
        password,
      })

      setAuth(data.user, data.token)
      setSuccessMessage("LOGIN BERHASIL! MENGALIHKAN...")

      setTimeout(() => {
        router.push("/dashboard")
      }, 1200)
    } catch (err: any) {
      const data = err.response?.data

      if (data?.code === "USER_BANNED") {
        setIsBanned(true)
        setBanDetails({
          reason: data.reason || "MELANGGAR ATURAN PLATFORM",
          until: formatBanDate(data.banned_until),
        })
        return
      }

      setError(
        data?.message ||
          "LOGIN GAGAL! PERIKSA KEMBALI EMAIL & PASSWORD"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md border-2 border-black bg-[#0E1318] p-8 font-mono text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-8">
        <div className="mb-4 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
          WELCOME BACK
        </div>

        <h1 className="text-4xl font-black uppercase tracking-tight">
          Login Account
        </h1>

        <p className="mt-3 text-xs font-bold uppercase leading-relaxed text-zinc-500">
          Login dan mulai push rank bersama squadmu.
        </p>
      </div>

      {/* NOTIFIKASI ERROR STANDAR */}
      {error && !isBanned && (
        <div className="mb-6 border-2 border-black bg-[#2A1414] p-4 text-xs font-black uppercase tracking-wider text-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      {/* NOTIFIKASI AKUN BANNED CUSTOM EMBED UI */}
      {isBanned && (
        <div className="mb-6 border-4 border-red-600 bg-[#160B0B] p-4 font-mono shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 border-b-2 border-red-600/30 pb-2 text-red-500">
            <AlertTriangle size={18} className="stroke-[2.5]" />
            <span className="text-sm font-black uppercase tracking-tight">ACCESS TERMINATED</span>
          </div>
          
          <div className="mt-3 space-y-1.5 text-[11px] font-bold uppercase tracking-wide">
            <p className="text-zinc-400">
              STATUS: <span className="text-red-500 font-black">BANNED</span>
            </p>
            <p className="text-zinc-400 leading-normal">
              ALASAN: <span className="text-white font-black">{banDetails.reason}</span>
            </p>
            <p className="text-zinc-400">
              SAMPAI: <span className="text-yellow-500 font-black">{banDetails.until}</span>
            </p>
          </div>
        </div>
      )}

      {/* NOTIFIKASI BERHASIL */}
      {successMessage && (
        <div className="mb-6 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in duration-150">
          ⚡ {successMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="email"
          placeholder="EMAIL ADDRESS"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18] transition-colors"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-full border-2 border-black bg-[#191B1F] pl-5 pr-14 text-xs font-bold text-white outline-none focus:border-[#53FC18] transition-colors"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-zinc-500 transition-colors hover:text-[#53FC18]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="mt-2 flex h-14 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {loading ? "LOADING..." : "LOGIN"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-wide text-zinc-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-black text-[#53FC18] underline underline-offset-4 hover:text-[#6eff3b]"
        >
          Register
        </Link>
      </p>
    </div>
  )
}

// Membungkus konten ke dalam Suspense agar aman dari error Next.js saat build / menggunakan useSearchParams
export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="border-2 border-black bg-[#0E1318] p-8 font-mono text-[#53FC18] text-xs font-black uppercase tracking-widest animate-pulse">
          INITIALIZING SECURE TERMINAL...
        </div>
      }>
        <LoginContent />
      </Suspense>
    </AuthLayout>
  )
}