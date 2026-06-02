"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import {
  Home,
  LayoutDashboard,
  Users,
  Trophy,
  MessageCircle,
  User,
  Settings,
  Shield,
  Wallet,
  ShoppingBag,
  LogOut,
  Crown,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react"

const baseMenus = [
  { title: "Home", href: "/", icon: Home },
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Matchmaking", href: "/matchmaking", icon: Users },
  { title: "Tournament", href: "/tournament", icon: Trophy },
  { title: "Chat", href: "/chat", icon: MessageCircle },
  { title: "Wallet", href: "/wallet", icon: Wallet },
  { title: "Shop", href: "/shop", icon: ShoppingBag },
  { title: "Pro VIP", href: "/pro", icon: Crown },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const user = useAuthStore((state) => state.user)
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
      ? [{ title: "Pro Panel", href: "/pro/dashboard", icon: Crown }]
      : []),
    ...(authUser?.role === "admin"
      ? [{ title: "Admin", href: "/admin", icon: Shield }]
      : []),
  ]

  // Ambil 4 menu utama untuk Bottom Nav di HP, sisanya masuk ke tombol "More"
  const mobilePrimaryMenus = menus.slice(0, 4)

  async function handleLogout() {
    try {
      await logout()
      setIsMobileMenuOpen(false)
      router.push("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (Hanya muncul di layar lg ke atas)                        */}
      {/* ========================================================================= */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r-2 border-[#191B1F] bg-[#0B0E11] font-mono lg:flex lg:flex-col">
        <div className="border-b-2 border-[#191B1F] p-4">
          <Link href="/" className="block">
            <div className="flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="MABAR Logo"
                width={320}
                height={120}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </Link>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-3">
          {menus.map((menu) => {
            const Icon = menu.icon
            const active =
              pathname === menu.href ||
              (menu.href !== "/" && pathname.startsWith(menu.href))

            return (
              <Link
                key={menu.title}
                href={menu.href}
                className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-black uppercase tracking-tight transition-all ${
                  active
                    ? "translate-x-[-2px] translate-y-[-2px] border-black bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "border-transparent text-zinc-400 hover:border-[#191B1F] hover:bg-[#191B1F] hover:text-white"
                }`}
              >
                <Icon size={18} className={active ? "stroke-[2.5]" : "stroke-2"} />
                <span>{menu.title}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t-2 border-[#191B1F] bg-[#0e1318] p-4">
          <Link
            href="/profile"
            className="mb-3 flex items-center gap-3 border-2 border-[#191B1F] bg-[#0B0E11] p-3 transition-all hover:border-[#53FC18]"
          >
            <div className="relative shrink-0">
              {authUser?.avatar_url ? (
                <Image
                  src={authUser.avatar_url}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="h-12 w-12 border-2 border-black object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-[#191B1F] text-lg font-black uppercase text-[#53FC18]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 border-2 border-black bg-[#53FC18]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-black uppercase tracking-tight text-white">
                {displayName}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                {authUser?.role || "user"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center justify-center gap-2 border-2 border-black bg-red-950/20 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-red-500 transition-all hover:bg-red-600 hover:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <LogOut size={14} className="stroke-[2.5]" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION (Otomatis aktif di layar < lg)                   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t-4 border-black bg-[#0B0E11] font-mono lg:hidden">
        <div className="grid h-16 grid-cols-5 items-center justify-items-center">
          {mobilePrimaryMenus.map((menu) => {
            const Icon = menu.icon
            const active =
              pathname === menu.href ||
              (menu.href !== "/" && pathname.startsWith(menu.href))

            return (
              <Link
                key={menu.title}
                href={menu.href}
                className={`flex h-full w-full flex-col items-center justify-center gap-1 border-r border-zinc-900 transition-colors ${
                  active ? "bg-[#53FC18] text-black" : "text-zinc-400"
                }`}
              >
                <Icon size={20} className={active ? "stroke-[2.5]" : "stroke-2"} />
                <span className="text-[9px] font-black uppercase tracking-tighter truncate max-w-full px-1">
                  {menu.title}
                </span>
              </Link>
            )
          })}

          {/* Tombol pemicu Drawer Menu Samping untuk sisa menu lainnya */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex h-full w-full flex-col items-center justify-center gap-1 transition-colors ${
              isMobileMenuOpen ? "bg-[#53FC18] text-black" : "text-zinc-400"
            }`}
          >
            <Menu size={20} className="stroke-[2.5]" />
            <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER OVERLAY (Slide-out dari kanan)                              */}
      {/* ========================================================================= */}
      <div
        className={`fixed inset-0 z-50 transform font-mono transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Backdrop hitam transparan */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className="absolute bottom-0 right-0 top-0 flex h-full w-4/5 max-w-xs flex-col border-l-4 border-black bg-[#0B0E11] p-4 shadow-[-4px_0px_0px_0px_rgba(0,0,0,1)]">
          {/* Header Drawer */}
          <div className="flex items-center justify-between border-b-2 border-[#191B1F] pb-4">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              Navigation Menu
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="border-2 border-black bg-zinc-900 p-1 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
            >
              <X size={16} className="stroke-[2.5]" />
            </button>
          </div>

          {/* List Menu Lengkap di Mobile */}
          <nav className="custom-scrollbar mt-4 flex-1 space-y-1.5 overflow-y-auto">
            {menus.map((menu) => {
              const Icon = menu.icon
              const active =
                pathname === menu.href ||
                (menu.href !== "/" && pathname.startsWith(menu.href))

              return (
                <Link
                  key={menu.title}
                  href={menu.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 border-2 px-4 py-2.5 text-xs font-black uppercase tracking-tight transition-all ${
                    active
                      ? "border-black bg-[#53FC18] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      : "border-transparent text-zinc-400 hover:border-[#191B1F] hover:bg-[#191B1F] hover:text-white"
                  }`}
                >
                  <Icon size={16} className={active ? "stroke-[2.5]" : "stroke-2"} />
                  <span>{menu.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout di bawah Drawer */}
          <div className="mt-auto border-t-2 border-[#191B1F] pt-4">
            <div className="mb-3 flex items-center gap-3 border-2 border-[#191B1F] bg-[#0E1318] p-2.5">
              <div className="relative shrink-0">
                {authUser?.avatar_url ? (
                  <Image
                    src={authUser.avatar_url}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="h-9 w-9 border border-black object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center border border-black bg-[#191B1F] text-xs font-black uppercase text-[#53FC18]">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xs font-black uppercase tracking-tight text-white">
                  {displayName}
                </h2>
                <p className="text-[9px] font-black uppercase text-[#53FC18]">
                  {authUser?.role || "user"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowLogoutConfirm(true)
              }}
              className="flex w-full items-center justify-center gap-2 border-2 border-black bg-red-950/40 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-red-500"
            >
              <LogOut size={12} />
              <span>LOGOUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOGOUT CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border-4 border-black bg-[#0B0E11] p-6 shadow-[8px_8px_0px_0px_rgba(83,252,24,1)]">
            <div className="flex items-center gap-3 border-b-2 border-[#191B1F] pb-4 text-red-500">
              <AlertTriangle size={24} className="stroke-[2.5]" />
              <h3 className="text-lg font-black uppercase tracking-tight">
                TERMINATE SESSION?
              </h3>
            </div>

            <p className="mt-4 text-xs font-bold uppercase leading-relaxed tracking-wide text-zinc-400">
              Apakah kamu yakin ingin keluar dari{" "}
              <span className="text-[#53FC18]">mabar.cu</span>? Kamu harus login
              kembali untuk mengakses fitur matchmaking dan chat group.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="h-12 flex-1 border-2 border-black bg-[#191B1F] text-xs font-black uppercase tracking-wider text-white transition-colors hover:bg-zinc-800"
              >
                Kembali
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="h-12 flex-1 border-2 border-black bg-red-600 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 active:translate-x-[1px] active:translate-y-[1px]"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}