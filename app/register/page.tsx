"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AuthLayout from "@/components/layout/AuthLayout"
import { registerUser } from "@/services/auth.service"

export default function RegisterPage() {
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

      // Jeda sejenak untuk transisi visual agar user tahu prosesnya sukses
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || "REGISTER GAGAL! AKUN ATAU EMAIL MUNGKIN SUDAH DIGUNAKAN")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md border-2 border-black bg-[#0E1318] p-8 font-mono text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-4 inline-flex border border-black bg-[#53FC18]/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-[#53FC18]">
            JOIN COMMUNITY
          </div>

          <h1 className="text-4xl font-black uppercase tracking-tight">Create Account</h1>

          <p className="mt-3 text-xs font-bold uppercase text-zinc-500 leading-relaxed">
            Temukan squad terbaikmu sekarang.
          </p>
        </div>

        {/* ALERT ERROR (KOTAK MERAH BRUTAL) */}
        {error && (
          <div className="mb-6 border-2 border-black bg-[#2A1414] p-4 text-xs font-black uppercase tracking-wider text-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            ❌ {error}
          </div>
        )}

        {/* ALERT SUKSES (KOTAK HIJAU NEON) */}
        {successMessage && (
          <div className="mb-6 border-2 border-black bg-[#142A14] p-4 text-xs font-black uppercase tracking-wider text-[#53FC18] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            ⚡ {successMessage}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18]"
              required
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full border-2 border-black bg-[#191B1F] px-5 text-xs font-bold uppercase tracking-wide text-white outline-none focus:border-[#53FC18]"
              required
            />
          </div>

          {/* INPUT PASSWORD + EYE TOGGLE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full border-2 border-black bg-[#191B1F] pl-5 pr-14 text-xs font-bold text-white outline-none focus:border-[#53FC18]"
              required
            />
            
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-[#53FC18] transition-colors"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          {/* TOMBOL DAFTAR DENGAN HARD-SHADOW CLICK EFFECT */}
          <button
            disabled={loading}
            className="mt-2 flex h-14 w-full items-center justify-center border-2 border-black bg-[#53FC18] text-xs font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </form>

        {/* FOOTER LINK */}
        <p className="mt-8 text-center text-xs font-bold uppercase tracking-wide text-zinc-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-black text-[#53FC18] underline underline-offset-4 hover:text-[#6eff3b]">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}