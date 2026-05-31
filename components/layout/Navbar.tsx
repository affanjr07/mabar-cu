"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

const baseMenus = [
  { title: "Home", href: "/" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Matchmaking", href: "/matchmaking" },
  { title: "Tournament", href: "/tournament" },
  { title: "Chat", href: "/chat" },
  { title: "Wallet", href: "/wallet" },
  { title: "Shop", href: "/shop" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  const authUser = user as any

  const displayName =
    authUser?.display_name ||
    authUser?.username ||
    authUser?.email?.split("@")[0] ||
    "Player"

  const menus = [
    ...baseMenus,
    ...(authUser?.role === "pro_player" || authUser?.role === "admin"
      ? [{ title: "Pro Panel", href: "/pro/dashboard" }]
      : []),
    ...(authUser?.role === "admin"
      ? [{ title: "Admin", href: "/admin" }]
      : []),
  ]

  async function handleLogout() {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.log("Logout failed:", error)
    }
  }

  // LOGIKAL PENYARINGAN PATH:
  // Jika rute URL saat ini BUKAN halaman beranda utama ('/'), Navbar akan mengembalikan nilai null (tidak merender apapun).
  // Dengan ini, halaman chat, dashboard, dll yang memakai layout global tidak akan menabrak header ini.
  if (pathname !== "/") {
    return null
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b-2 border-[#191B1F] bg-[#0B0E11] font-mono">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex max-w-[180px] items-center sm:max-w-[220px]"
        >
          <Image
            src="/logo.png"
            alt="MABAR Logo"
            width={240}
            height={80}
            priority
            className="h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
          />
        </Link>

        <nav className="hidden h-full items-center gap-1 xl:flex">
          {menus.map((menu) => {
            const active =
              pathname === menu.href ||
              (menu.href !== "/" && pathname.startsWith(menu.href))

            return (
              <Link
                key={menu.title}
                href={menu.href}
                className={`flex h-11 items-center border-2 px-3.5 text-xs font-black uppercase tracking-tight transition-all duration-150 ${
                  active
                    ? "translate-x-[-1px] translate-y-[-1px] border-black bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "border-transparent text-zinc-400 hover:border-[#191B1F] hover:bg-[#191B1F] hover:text-white"
                }`}
              >
                {menu.title}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="flex h-11 items-center border-2 border-[#191B1F] bg-transparent px-5 text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-[#191B1F]"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="flex h-11 items-center border-2 border-black bg-[#53FC18] px-5 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Start Mabar
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/profile")}
                className="flex h-12 items-center gap-3 border-2 border-[#191B1F] bg-[#0E1318] px-3 text-left transition-all hover:border-[#53FC18]"
              >
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-zinc-700 bg-[#191B1F]">
                  {authUser?.avatar_url ? (
                    <Image
                      src={authUser.avatar_url}
                      alt="avatar"
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xs font-black uppercase text-[#53FC18]">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="hidden min-w-0 max-w-[100px] sm:block">
                  <p className="truncate text-xs font-black uppercase tracking-tight text-white">
                    {displayName}
                  </p>

                  <p className="truncate text-[9px] font-black uppercase tracking-widest text-[#53FC18]">
                    {authUser?.role || "user"}
                  </p>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="flex h-12 items-center border-2 border-black bg-red-600 px-4 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 active:translate-x-[1px] active:translate-y-[1px]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}