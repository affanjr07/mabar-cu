"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import { useRouter } from "next/navigation"
import { 
  Swords, 
  Trophy, 
  Users, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Gamepad2, 
  Sparkles, 
  MessageSquare,
  TrendingUp 
} from "lucide-react"

// Mock Data untuk Iklan Banner Slider Otomatis
const promotions = [
  {
    id: 1,
    title: "UPCOMING TOURNAMENT VALORANT",
    subtitle: "REGISTRATION OPEN FOR ACT II",
    tag: "VALORANT",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop", // Ganti dengan foto tokomu nanti
    link: "/tournament"
  },
  {
    id: 2,
    title: "REKRUT TIM ESPORTS PROFESSIONAL",
    subtitle: "TALENT SCOUTING SELECTION STAGE",
    tag: "SCOUTING",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop", // Ganti dengan foto tokomu nanti
    link: "/matchmaking"
  },
  {
    id: 3,
    title: "LIMITED MERCHANDISE DROP 01",
    subtitle: "EXCLUSIVE CYBERPUNK SQUAD JERSEY",
    tag: "STORE",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=1200&auto=format&fit=crop", // Ganti dengan foto tokomu nanti
    link: "#"
  }
]

// Mock Data Game Populer
const featuredGames = [
  { name: "Mobile Legends", activeRooms: "2.4K Players", genre: "MOBA" },
  { name: "Valorant", activeRooms: "1.8K Players", genre: "FPS" },
  { name: "PUBG Mobile", activeRooms: "950 Players", genre: "BATTLE ROYALE" },
  { name: "Dota 2", activeRooms: "420 Players", genre: "MOBA" },
]

export default function HomePage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Otomatis geser slider promo setiap 4 detik
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promotions.length)
    }, 4000)
    return () => clearInterval(slideInterval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0E11] text-white font-mono selection:bg-[#53FC18] selection:text-black">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#191B1F_1px,transparent_1px),linear-gradient(to_bottom,#191B1F_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 mx-auto max-w-6xl py-12 text-center">
          <div className="mb-6 inline-flex items-center border-2 border-black bg-[#191B1F] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="mr-2 animate-pulse text-base">🎮</span> INDONESIA #1 GAMING SQUAD PLATFORM
          </div>

          <h1 className="text-5xl font-black leading-none uppercase tracking-tighter md:text-8xl">
            FIND YOUR
            <br />
            <span className="border-2 border-black bg-[#53FC18] px-4 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block my-2 transform -rotate-1">
              ULTIMATE
            </span>
            <br />
            SQUAD
          </h1>

          <p className="mx-auto mt-10 max-w-2xl text-xs font-bold uppercase tracking-wider leading-relaxed text-zinc-400 md:text-sm">
            Cari teman mabar, bentuk party rank, ikut tournament esports,
            dan bangun komunitas gaming terbaikmu tanpa drama tier pool.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto flex h-14 items-center justify-center gap-2 border-2 border-black bg-[#53FC18] px-8 text-base font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b]"
            >
              🚀 Start Mabar
            </button>

            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto flex h-14 items-center justify-center border-2 border-[#191B1F] bg-[#0E1318] px-8 text-base font-black uppercase text-white tracking-tight transition-colors hover:bg-[#191B1F] hover:border-zinc-700"
            >
              Explore Players
            </button>
          </div>

          {/* STATS GRID */}
          <div className="mt-24 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["25K+", "Gamers Connected", <Users size={20} className="text-zinc-500" />],
              ["10K+", "Active Rooms", <Swords size={20} className="text-zinc-500" />],
              ["500+", "Tournaments", <Trophy size={20} className="text-zinc-500" />],
              ["99%", "Match Rate", <Activity size={20} className="text-zinc-500" />],
            ].map(([number, label, icon]) => (
              <div
                key={label as string}
                className="border-2 border-black bg-[#0E1318] p-5 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:border-[#53FC18] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-3xl font-black tracking-tight text-[#53FC18] sm:text-4xl">
                    {number as string}
                  </h2>
                  <div>{icon as React.ReactNode}</div>
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400">
                  {label as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER TEXT EFFECT */}
      <div className="overflow-hidden border-y-2 border-black bg-[#191B1F] py-3 text-xs font-black uppercase tracking-widest text-[#53FC18]">
        <div className="whitespace-nowrap inline-flex gap-8 animate-marquee-fast">
          <span>• BUILD SQUAD • GAIN RANK • WIN PRIZES • NO TOXIC ZONE • UPGRADE YOUR SKILLS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW</span>
          <span>• BUILD SQUAD • GAIN RANK • WIN PRIZES • NO TOXIC ZONE • UPGRADE YOUR SKILLS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW</span>
        </div>
      </div>

      {/* FEATURED ACTIVE GAMES SHOWCASE (IDE TAMBAHAN 1) */}
      <section className="px-6 pt-24 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between border-b-2 border-[#191B1F] pb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-[#53FC18]" size={20} />
            <h3 className="text-xl font-black uppercase tracking-tight">POPULAR ARENAS</h3>
          </div>
          <span className="text-[10px] bg-[#191B1F] px-2 py-1 font-bold text-zinc-400">LIVE FEED</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredGames.map((game) => (
            <div key={game.name} className="border-2 border-[#191B1F] bg-[#0E1318] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:border-[#53FC18] transition-all group">
              <span className="text-[9px] font-black text-[#53FC18] bg-[#53FC18]/10 px-2 py-0.5">{game.genre}</span>
              <h4 className="text-base font-black uppercase mt-2 group-hover:text-[#53FC18] transition-colors">{game.name}</h4>
              <div className="flex items-center gap-1.5 mt-4 text-[11px] font-bold text-zinc-500">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                {game.activeRooms}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE AUTOMATIC PROMOTION SLIDER (PERMINTAAN UTAMA) */}
      <section className="px-6 pt-24 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-[#53FC18]" size={18} />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">// SPONSORED DIRECTIVES</h3>
        </div>

        <div className="relative border-2 border-black bg-[#0E1318] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden h-[300px] md:h-[380px] group">
          {promotions.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out flex flex-col justify-end p-6 md:p-12 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Gambar Banner Latar */}
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-40 mix-blend-luminosity group-hover:grayscale-0 transition-all duration-500" style={{ backgroundImage: `url(${slide.image})` }} />
              {/* Overlay gelap agar teks terbaca */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Konten Teks Banner */}
              <div className="relative z-10 max-w-2xl">
                <span className="border border-black bg-[#53FC18] px-2.5 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                  {slide.tag}
                </span>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mt-3 text-white leading-none">
                  {slide.title}
                </h2>
                <p className="text-xs font-bold text-[#53FC18] uppercase mt-1 tracking-wide">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => router.push(slide.link)}
                  className="mt-6 border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#53FC18] transition-all active:translate-y-0.5"
                >
                  CHECK MISSION
                </button>
              </div>
            </div>
          ))}

          {/* Tombol Kontrol Navigasi Manual */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 border-2 border-black bg-black text-white flex items-center justify-center hover:bg-[#53FC18] hover:text-black transition-colors"
          >
            <ChevronLeft size={20} className="stroke-[3]" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 border-2 border-black bg-black text-white flex items-center justify-center hover:bg-[#53FC18] hover:text-black transition-colors"
          >
            <ChevronRight size={20} className="stroke-[3]" />
          </button>

          {/* Indikator Titik Posisi Slide */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 w-2 border border-black ${i === currentSlide ? "bg-[#53FC18]" : "bg-zinc-700"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTION BANNER SECTION */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl border-2 border-black bg-[#0E1318] p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#53FC18]/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex border border-black bg-[#53FC18] px-3 py-1 text-xs font-black text-black uppercase tracking-wider">
              🔥 PROMOTED EVENT
            </div>

            <h2 className="text-3xl font-black leading-none uppercase tracking-tighter sm:text-5xl">
              MABAR CHAMPIONSHIP
              <br />
              <span className="text-[#53FC18]">SEASON 2026</span>
            </h2> 

            <p className="mt-6 text-xs font-bold uppercase tracking-wide leading-relaxed text-zinc-400">
              Ikuti kompetisi esports nasional terbesar tahun ini. 
              Bentuk tim, bantai bracket kualifikasi, dan rebut total prize pool senilai 
              <span className="text-white bg-[#191B1F] px-1.5 py-0.5 ml-1 font-black">Rp 50.000.000</span>.
            </p>

            <button 
              onClick={() => router.push("/tournament")}
              className="mt-8 border-2 border-black bg-[#53FC18] px-6 py-3.5 text-sm font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Join Tournament
            </button>
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY FEED RADAR (IDE TAMBAHAN 2) */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <div className="border-2 border-[#191B1F] bg-[#0E1318]/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3">
            <div className="p-2 border-2 border-dashed border-red-500 text-red-500 animate-pulse">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-500">RADAR ACTIVE FEED</p>
              <p className="text-xs font-black uppercase text-white tracking-wide">
                [SQUAD_RECRUITMENT] USER <span className="text-[#53FC18]">@ViperX</span> SEEDING ROOM VALORANT DIAMOND POOL
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2 text-[11px] font-black uppercase text-[#53FC18] border-2 border-[#53FC18]/30 px-4 py-2 hover:bg-[#53FC18] hover:text-black transition-all"
          >
            <MessageSquare size={12} /> INTERCEPT CHAT FEED
          </button>
        </div>
      </section>

      {/* BRUTALIST QUOTES / VISION */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl border-2 border-dashed border-[#191B1F] bg-transparent p-8 text-center">
          <p className="text-xl font-black uppercase tracking-tight text-white md:text-3xl leading-snug">
            “GREAT SQUADS ARE NOT BUILT BY <span className="text-red-500">RANK</span>,
            <br />
            BUT BY <span className="text-[#53FC18]">CHEMISTRY</span>.”
          </p>
          <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            — MABAR.CU ESPORTS COMMUNITY EST. 2026
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#191B1F] bg-[#0E1318] p-8 font-mono text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="border border-zinc-700 px-2 py-0.5 font-black text-white bg-black">M</span>
            <p className="font-bold uppercase tracking-tight">
              © 2026 MABAR.CU • INDONESIA GAMING HUB.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-bold uppercase tracking-wider text-zinc-400">
            <a href="#" className="hover:text-[#53FC18] transition-colors">Support</a>
            <a href="#" className="hover:text-[#53FC18] transition-colors">Rules</a>
            <a href="#" className="hover:text-[#53FC18] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

    </main>
  )
}