"use client"

import { useEffect, useState, useCallback } from "react"
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
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop", // Dioptimalkan w=600 agar mobile ringan
    link: "/tournament"
  },
  {
    id: 2,
    title: "REKRUT TIM ESPORTS PROFESSIONAL",
    subtitle: "TALENT SCOUTING SELECTION STAGE",
    tag: "SCOUTING",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop", 
    link: "/matchmaking"
  },
  {
    id: 3,
    title: "LIMITED MERCHANDISE DROP 01",
    subtitle: "EXCLUSIVE CYBERPUNK SQUAD JERSEY",
    tag: "STORE",
    image: "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=600&auto=format&fit=crop", 
    link: "#"
  }
]

// Mock Data Game Populer
const featuredGames = [
  { name: "Mobile Legends", activeRooms: "", genre: "MOBA" },
  { name: "Valorant", activeRooms: "", genre: "FPS" },
  { name: "PUBG Mobile", activeRooms: "", genre: "BATTLE ROYALE" },
  { name: "Dota 2", activeRooms: "", genre: "MOBA" },
]

export default function HomePage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

 
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % promotions.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + promotions.length) % promotions.length)
  }, [])

  // Otomatis geser slider promo setiap 4 detik
  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 4000)
    return () => clearInterval(slideInterval)
  }, [nextSlide])

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0E11] text-white font-mono selection:bg-[#53FC18] selection:text-black felt-bleed">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 pt-24 pb-12">
        {/* Mengurangi kompleksitas mask-image di mobile agar rendering GPU lebih ringan */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#191B1F_1px,transparent_1px),linear-gradient(to_bottom,#191B1F_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-70 md:opacity-100 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-6xl text-center w-full">
          <div className="mb-6 inline-flex items-center border-2 border-black bg-[#191B1F] px-3 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#53FC18] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] max-w-full text-left sm:text-center">
            <span className="mr-2 animate-pulse text-sm md:text-base">🎮</span> INDONESIA #1 GAMING SQUAD PLATFORM
          </div>

          <h1 className="text-4xl font-black leading-[1.1] uppercase tracking-tighter sm:text-6xl md:text-8xl break-words">
            FIND YOUR
            <br />
            <span className="border-2 border-black bg-[#53FC18] px-3 md:px-4 py-1 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] inline-block my-2 transform -rotate-1 max-w-full text-2xl sm:text-5xl md:text-8xl">
              ULTIMATE
            </span>
            <br />
            SQUAD
          </h1>

          <p className="mx-auto mt-6 md:mt-10 max-w-2xl text-[11px] font-bold uppercase tracking-wider leading-relaxed text-zinc-400 sm:text-xs md:text-sm px-2">
            Cari teman mabar, bentuk party rank, ikut tournament esports,
            dan bangun komunitas gaming terbaikmu tanpa drama tier pool.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row px-4 sm:px-0">
            <button 
              onClick={() => router.push("/register")}
              className="w-full sm:w-auto flex h-12 md:h-14 items-center justify-center gap-2 border-2 border-black bg-[#53FC18] px-8 text-sm md:text-base font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-[#6eff3b]"
            >
              🚀 Start Mabar
            </button>

            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto flex h-12 md:h-14 items-center justify-center border-2 border-[#191B1F] bg-[#0E1318] px-8 text-sm md:text-base font-black uppercase text-white tracking-tight transition-colors hover:bg-[#191B1F] hover:border-zinc-700"
            >
              Explore Players
            </button>
          </div>

          {/* STATS GRID */}
          <div className="mt-16 md:mt-24 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {[
              ["25K+", "Gamers Connected", <Users size={18} className="text-zinc-500" />],
              ["10K+", "Active Rooms", <Swords size={18} className="text-zinc-500" />],
              ["500+", "Tournaments", <Trophy size={18} className="text-zinc-500" />],
              ["99%", "Match Rate", <Activity size={18} className="text-zinc-500" />],
            ].map(([number, label, icon]) => (
              <div
                key={label as string}
                className="border-2 border-black bg-[#0E1318] p-3 md:p-5 text-left shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:border-[#53FC18] transition-colors"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-black tracking-tight text-[#53FC18] sm:text-3xl md:text-4xl">
                    {number as string}
                  </h2>
                  <div className="scale-90 md:scale-100">{icon as React.ReactNode}</div>
                </div>
                <p className="mt-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 truncate">
                  {label as string}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TICKER TEXT EFFECT */}
      <div className="overflow-hidden border-y-2 border-black bg-[#191B1F] py-2.5 text-[10px] md:text-xs font-black uppercase tracking-widest text-[#53FC18]">
        {/* Ditambahkan will-change-transform agar animasi marquee berjalan smooth di HP low-end */}
        <div className="whitespace-nowrap inline-flex gap-8 animate-marquee-fast will-change-transform">
          <span>• BUILD SQUAD • GAIN RANK • WIN PRIZES • NO TOXIC ZONE • UPGRADE YOUR SKILLS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW</span>
          <span>• BUILD SQUAD • GAIN RANK • WIN PRIZES • NO TOXIC ZONE • UPGRADE YOUR SKILLS • MABAR.CU CHAMPIONSHIP 2026 IS LIVE NOW</span>
        </div>
      </div>

      {/* FEATURED ACTIVE GAMES SHOWCASE */}
      <section className="px-4 sm:px-6 pt-16 md:pt-24 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between border-b-2 border-[#191B1F] pb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-[#53FC18]" size={18} />
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">POPULAR ARENAS</h3>
          </div>
          <span className="text-[9px] md:text-[10px] bg-[#191B1F] px-2 py-0.5 md:py-1 font-bold text-zinc-400">LIVE FEED</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featuredGames.map((game) => (
            <div key={game.name} className="border-2 border-[#191B1F] bg-[#0E1318] p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:border-[#53FC18] transition-all group">
              <span className="text-[8px] md:text-[9px] font-black text-[#53FC18] bg-[#53FC18]/10 px-2 py-0.5">{game.genre}</span>
              <h4 className="text-sm md:text-base font-black uppercase mt-2 group-hover:text-[#53FC18] transition-colors">{game.name}</h4>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] md:text-[11px] font-bold text-zinc-500">
                <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
                {game.activeRooms}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE AUTOMATIC PROMOTION SLIDER */}
      <section className="px-4 sm:px-6 pt-16 md:pt-24 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-[#53FC18]" size={16} />
          <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400">// SPONSORED DIRECTIVES</h3>
        </div>

        <div className="relative border-2 border-black bg-[#0E1318] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden h-[280px] md:h-[380px] group">
          {promotions.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out flex flex-col justify-end p-5 md:p-12 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Optimasi Gambar: Menggunakan layout-fill imitasi CSS dengan lazy loading via CSS blend */}
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale opacity-35 sm:opacity-40 mix-blend-luminosity group-hover:grayscale-0 transition-all duration-500" 
                style={{ backgroundImage: `url(${slide.image})` }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

              {/* Konten Teks Banner */}
              <div className="relative z-10 max-w-2xl text-left">
                <span className="border border-black bg-[#53FC18] px-2 py-0.5 text-[9px] md:text-[10px] font-black text-black uppercase tracking-wider">
                  {slide.tag}
                </span>
                <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter mt-2 text-white leading-tight md:leading-none break-words">
                  {slide.title}
                </h2>
                <p className="text-[10px] md:text-xs font-bold text-[#53FC18] uppercase mt-1 tracking-wide line-clamp-1">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => router.push(slide.link)}
                  className="mt-4 md:mt-6 border-2 border-black bg-white px-3.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#53FC18] transition-all active:translate-y-0.5"
                >
                  CHECK MISSION
                </button>
              </div>
            </div>
          ))}

          {/* Tombol Kontrol Navigasi Manual - Sembunyikan/Kecilkan di mobile ultra kecil agar tidak menutupi teks */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 border-2 border-black bg-black text-white flex items-center justify-center hover:bg-[#53FC18] hover:text-black transition-colors opacity-70 md:opacity-100"
          >
            <ChevronLeft size={16} className="stroke-[3] md:size-[20]" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 md:h-10 md:w-10 border-2 border-black bg-black text-white flex items-center justify-center hover:bg-[#53FC18] hover:text-black transition-colors opacity-70 md:opacity-100"
          >
            <ChevronRight size={16} className="stroke-[3] md:size-[20]" />
          </button>

          {/* Indikator Titik Posisi Slide */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 w-1.5 md:h-2 md:w-2 border border-black transition-all ${i === currentSlide ? "bg-[#53FC18] scale-110" : "bg-zinc-700"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTION BANNER SECTION */}
      <section className="px-4 sm:px-6 py-16 md:py-20">
        <div className="mx-auto max-w-7xl border-2 border-black bg-[#0E1318] p-6 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-[#53FC18]/5 to-transparent pointer-events-none hidden sm:block" />
          
          <div className="relative z-10 max-w-3xl text-left">
            <div className="mb-4 inline-flex border border-black bg-[#53FC18] px-2.5 py-0.5 text-[10px] md:text-xs font-black text-black uppercase tracking-wider">
              🔥 PROMOTED EVENT
            </div>

            <h2 className="text-2xl font-black leading-tight uppercase tracking-tighter sm:text-4xl md:text-5xl break-words">
              MABAR CHAMPIONSHIP
              <br />
              <span className="text-[#53FC18]">SEASON 2026</span>
            </h2> 

            <p className="mt-4 md:mt-6 text-[11px] md:text-xs font-bold uppercase tracking-wide leading-relaxed text-zinc-400">
              Ikuti kompetisi esports nasional terbesar tahun ini. 
              Bentuk tim, bantai bracket kualifikasi, dan rebut total prize pool senilai 
              <span className="inline-block text-white bg-[#191B1F] px-1.5 py-0.5 mt-1 sm:mt-0 sm:ml-1 font-black whitespace-nowrap">Coming Soon</span>.
            </p>

            <button 
              onClick={() => router.push("/tournament")}
              className="mt-6 md:mt-8 w-full sm:w-auto border-2 border-black bg-[#53FC18] px-6 py-3 text-xs md:text-sm font-black uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#6eff3b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Join Tournament
            </button>
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY FEED RADAR */}
      <section className="px-4 sm:px-6 pb-16 md:pb-20 max-w-7xl mx-auto">
        <div className="border-2 border-[#191B1F] bg-[#0E1318]/40 p-4 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start gap-3 w-full">
            <div className="p-2 border-2 border-dashed border-red-500 text-red-500 animate-pulse shrink-0">
              <TrendingUp size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase text-zinc-500">RADAR ACTIVE FEED</p>
              <p className="text-[11px] md:text-xs font-black uppercase text-white tracking-wide break-words sm:truncate">
                [SQUAD_RECRUITMENT] USER <span className="text-[#53FC18]">@ViperX</span> SEEDING ROOM VALORANT DIAMOND POOL
              </p>
            </div>
          </div>
          <button 
            onClick={() => router.push("/chat")}
            className="w-full lg:w-auto flex items-center justify-center gap-2 text-[10px] md:text-[11px] font-black uppercase text-[#53FC18] border-2 border-[#53FC18]/30 px-4 py-2.5 hover:bg-[#53FC18] hover:text-black transition-all"
          >
            <MessageSquare size={12} /> INTERCEPT CHAT FEED
          </button>
        </div>
      </section>

      {/* BRUTALIST QUOTES / VISION */}
      <section className="px-4 sm:px-6 pb-20 md:pb-24">
        <div className="mx-auto max-w-5xl border-2 border-dashed border-[#191B1F] bg-transparent p-6 md:p-8 text-center">
          <p className="text-base font-black uppercase tracking-tight text-white sm:text-2xl md:text-3xl leading-snug break-words">
            “GREAT SQUADS ARE NOT BUILT BY <span className="text-red-500">RANK</span>,
            <br className="hidden sm:block" />
            BUT BY <span className="text-[#53FC18]">CHEMISTRY</span>.”
          </p>
          <p className="mt-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600">
            — MABAR.CU ESPORTS COMMUNITY EST. 2026
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#191B1F] bg-[#0E1318] p-6 md:p-8 font-mono text-[11px] md:text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="border border-zinc-700 px-2 py-0.5 font-black text-white bg-black">M</span>
            <p className="font-bold uppercase tracking-tight text-[10px] md:text-xs">
              © 2026 MABAR.CU • INDONESIA GAMING HUB.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1 font-bold uppercase tracking-wider text-zinc-400">
            <a href="#" className="hover:text-[#53FC18] transition-colors">Support</a>
            <a href="#" className="hover:text-[#53FC18] transition-colors">Rules</a>
            <a href="#" className="hover:text-[#53FC18] transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

    </main>
  )
}