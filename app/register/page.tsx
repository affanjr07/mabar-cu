"use client"

import { useState, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthLayout from "@/components/layout/AuthLayout"
import { registerUser } from "@/services/auth.service"
import { Eye, EyeOff } from "lucide-react"

function RegisterContent() {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return // Mencegah spam klik ganda di mobile network yang lambat

    try {
      setLoading(true)
      setError("")
      setSuccessMessage("")

      await registerUser({
        username,
        email,
        password,
      })

      setSuccessMessage("REGISTRASI BERHASIL! MENGALIHKAN KE HALAMAN LOGIN...")

      setTimeout(() => {
        router.push("/login")
      }, 1200)
    } catch (err: any) {
      setError(err.response?.data?.message || "REGISTER GAGAL! AKUN ATAU EMAIL MUNGKIN SUDAH DIGUNAKAN")
    } finally {
      setLoading(false)
    }
  }

  return (
    // MODIFIKASI: Ukuran p-5 di mobile, p-8 di desktop agar box tidak memotong layar HP sempit
    <div className="w-full max-w-md border-2 border-black bg-[#0E1318] p-5 sm:p-8 font-mono text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#53FC18]">
          JOIN COMMUNITY
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">Create Account</h1>

        <p className="mt-2 text-[11px] sm:text-xs font-bold uppercase text-zinc-500 leading-relaxed">
          Temukan squad terbaikmu sekarang.
        </p>
      </div>

      {/* ALERT ERROR (KOTAK MERAH BRUTAL) */}
      {error && (
        <div className="mb-5 border-2 border-black bg-[#2A1414] p-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-150">
          ❌ {error}
        </div>
      )}

      {/* ALERT SUKSES (KOTAK HIJAU NEON) */}
      {successMessage && (
        <div className="mb-5 border-2 border-black bg-[#142A14] p-3.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in duration-100">
          ⚡ {successMessage}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
        <div>
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-12 sm:h-14 w-full border-2 border-black bg-[#191B1F] px-4 sm:px-5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18] transition-colors"
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 sm:h-14 w-full border-2 border-black bg-[#191B1F] px-4 sm:px-5 text-[11px] sm:text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18] transition-colors"
            required
          />
        </div>

        {/* INPUT PASSWORD + EYE ICON TOGGLE */}
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

        {/* TOMBOL DAFTAR DENGAN HARD-SHADOW CLICK EFFECT */}
        <button
          disabled={loading}
          className="mt-1 flex h-12 sm:h-14 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-[11px] sm:text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
        </button>
      </form>

      {/* FOOTER LINK */}
      <p className="mt-6 sm:mt-8 text-center text-[11px] sm:text-xs font-bold uppercase tracking-wide text-zinc-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-black text-[#53FC18] underline underline-offset-4 hover:text-[#6eff3b]">
          Login
        </Link>
      </p>
    </div>
  )
}

// OPTIMASI: Dibungkus React.memo agar rendering layout pembungkus (AuthLayout) terisolasi dengan baik
const MemoizedRegisterContent = memo(RegisterContent)

export default function RegisterPage() {
  return (
    <AuthLayout>
      <MemoizedRegisterContent />
    </AuthLayout>
  )
}