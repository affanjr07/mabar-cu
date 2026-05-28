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
} from "lucide-react"

const baseMenus = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Matchmaking",
    href: "/matchmaking",
    icon: Users,
  },
  {
    title: "Tournament",
    href: "/tournament",
    icon: Trophy,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    title: "Shop",
    href: "/shop",
    icon: ShoppingBag,
  },
  {
    title: "Pro VIP",
    href: "/pro",
    icon: Crown,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const menus = [
    ...baseMenus,

    ...(user?.role === "pro_player" || user?.role === "admin"
      ? [
          {
            title: "Pro Panel",
            href: "/pro/dashboard",
            icon: Crown,
          },
        ]
      : []),

    ...(user?.role === "admin"
      ? [
          {
            title: "Admin",
            href: "/admin",
            icon: Shield,
          },
        ]
      : []),
  ]

  const displayName =
    user?.display_name ||
    senderName ||
    user?.email?.split("@")[0] ||
    "Player"

  async function handleLogout() {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {/* SIDEBAR CONTAINER (Ditambahkan sticky top-0 agar mengunci posisi saat scroll) */}
      <aside className="hidden sticky top-0 h-screen w-72 border-r-2 border-[#191B1F] bg-[#0B0E11] font-mono lg:flex lg:flex-col">

        {/* LOGO */}
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

        {/* MENUS */}
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
                className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-black uppercase tracking-tight transition-all duration-150 ${
                  active
                    ? "translate-x-[-2px] translate-y-[-2px] border-black bg-[#53FC18] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : "border-transparent text-zinc-400 hover:border-[#191B1F] hover:bg-[#191B1F] hover:text-white"
                }`}
              >
                <Icon
                  size={18}
                  className={active ? "stroke-[2.5]" : "stroke-2"}
                />
                <span>{menu.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* FOOTER USER */}
        <div className="border-t-2 border-[#191B1F] bg-[#0e1318] p-4">
          <Link
            href="/profile"
            className="mb-3 flex items-center gap-3 border-2 border-[#191B1F] bg-[#0B0E11] p-3 transition-all hover:border-[#53FC18]"
          >
            {/* USER AVATAR */}
            <div className="relative shrink-0">
              {user?.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt="avatar"
                  width={48}
                  height={48}
                  className="h-12 w-12 border-2 border-black object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-[#191B1F] text-lg font-black uppercase text-[#53FC18]">
                  {displayName.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 border-2 border-black bg-[#53FC18]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-black uppercase tracking-tight text-white">
                {displayName}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#53FC18]">
                {user?.role || "user"}
              </p>
            </div>
          </Link>

          {/* LOGOUT BUTTON - Memicu state konfirmasi */}
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

      {/* NEO-BRUTALIST LOGOUT CONFIRMATION MODAL OVERLAY */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm border-4 border-black bg-[#0B0E11] p-6 shadow-[8px_8px_0px_0px_rgba(83,252,24,1)] transform scale-100 transition-transform duration-200">
            
            <div className="flex items-center gap-3 text-red-500 border-b-2 border-[#191B1F] pb-4">
              <AlertTriangle size={24} className="stroke-[2.5]" />
              <h3 className="text-lg font-black uppercase tracking-tight">TERMINATE SESSION?</h3>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide leading-relaxed text-zinc-400">
              Apakah kamu yakin ingin keluar dari <span className="text-[#53FC18]">mabar.cu</span>? Kamu harus login kembali untuk mengakses fitur matchmaking dan chat group.
            </p>

            <div className="mt-6 flex gap-3">
              {/* Tombol Batal */}
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 h-12 border-2 border-black bg-[#191B1F] text-xs font-black uppercase text-white tracking-wider transition-colors hover:bg-zinc-800"
              >
                Kembali
              </button>

              {/* Tombol Eksekusi Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 h-12 border-2 border-black bg-red-600 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-red-500 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Ya, Kelua
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}