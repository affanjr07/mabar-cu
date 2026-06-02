"use client"

import { useState, useEffect, Suspense, memo } from "react"
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
      return date
    }
  }

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
    if (loading) return // Mencegah double submit jika user spam tombol di HP

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
      }, 1000)
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
        data?.message || "LOGIN GAGAL! PERIKSA KEMBALI EMAIL & PASSWORD"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    // MODIFIKASI: w-full max-w-md dengan padding responsif p-5 di mobile, p-8 di desktop agar tidak sesak
    <div className="w-full max-w-md border-2 border-black bg-[#0E1318] p-5 sm:p-8 font-mono text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#53FC18]">
          WELCOME BACK
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
          Login Account
        </h1>

        <p className="mt-2 text-[11px] sm:text-xs font-bold uppercase leading-relaxed text-zinc-500">
          Login dan mulai push rank bersama squadmu.
        </p>
      </div>

      {/* NOTIFIKASI ERROR */}
      {error && !isBanned && (
        <div className="mb-5 border-2 border-black bg-[#2A1414] p-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-150">
          {error}
        </div>
      )}

      {/* NOTIFIKASI BANNED */}
      {isBanned && (
        <div className="mb-5 border-2 sm:border-4 border-red-600 bg-[#160B0B] p-3 sm:p-4 font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 border-b border-red-600/30 pb-2 text-red-500">
            <AlertTriangle size={16} className="stroke-[2.5] shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-tight">ACCESS TERMINATED</span>
          </div>
          
          <div className="mt-2.5 space-y-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wide">
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
        <div className="mb-5 border-2 border-black bg-[#142A14] p-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center animate-in fade-in duration-100">
          ⚡ {successMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
        <input
          type="email"
          placeholder="EMAIL ADDRESS"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 sm:h-14 w-full border-2 border-black bg-[#191B1F] px-4 sm:px-5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18] transition-colors"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 sm:h-14 w-full border-2 border-black bg-[#191B1F] pl-4 sm:pl-5 pr-12 sm:pr-14 text-[11px] sm:text-xs font-bold text-white outline-none focus:border-[#53FC18] transition-colors"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center text-zinc-500 transition-colors hover:text-[#53FC18] active:scale-90"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="mt-1 flex h-12 sm:h-14 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-[11px] sm:text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {loading ? "LOADING..." : "LOGIN"}
        </button>
      </form>

      <p className="mt-6 sm:mt-8 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wide text-zinc-500">
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

// OPTIMASI: Bungkus komponen utama dengan memo agar tidak terjadi re-render eksternal yang tidak diperlukan dari AuthLayout
const MemoizedLoginContent = memo(LoginContent)

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="border-2 border-black bg-[#0E1318] p-6 sm:p-8 font-mono text-[#53FC18] text-[11px] sm:text-xs font-black uppercase tracking-widest animate-pulse">
          INITIALIZING SECURE TERMINAL...
        </div>
      }>
        <MemoizedLoginContent />
      </Suspense>
    </AuthLayout>
  )
}