"use client"

import { memo } from "react"
import Sidebar from "@/components/layout/Sidebar"
import { 
  User, 
  Gamepad2, 
  Bell, 
  ShieldCheck, 
  Layers, 
  Monitor, 
  KeyRound, 
  Trash2, 
  Check 
} from "lucide-react"

function SettingsContent() {
  return (
    <main className="flex min-h-screen bg-[#0B0E11] font-mono text-white relative antialiased">
      {/* BACKGROUND TEXTURE OVERLAY (Ringan & Estetis) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#191B1F_1px,transparent_1px),linear-gradient(to_bottom,#191B1F_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <Sidebar />

      <section className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative z-10 selection:bg-[#53FC18] selection:text-black">
        
        {/* HEADER SECTION */}
        <div className="mb-6 sm:mb-8 border-b-2 border-zinc-800/50 pb-6">
          <div className="mb-3 inline-flex border border-black bg-[#53FC18]/10 px-2.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#53FC18]">
            CORE CONTROL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-[11px] sm:text-xs font-bold uppercase text-zinc-500 leading-relaxed">
            Kelola konfigurasi akun, preferensi mabar, dan hak privasi platform kamu.
          </p>
        </div>

        {/* CONTAINER GRID */}
        <div className="grid gap-6 max-w-5xl">
          
          {/* ACCOUNT SETTINGS */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(83,252,24,1)] sm:shadow-[5px_5px_0px_0px_rgba(83,252,24,1)] transition-all">
            <div className="flex items-center gap-2 text-[#53FC18] mb-4">
              <User size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Account Settings
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// USERNAME</span>
                <input
                  type="text"
                  placeholder="Username"
                  className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-bold uppercase outline-none focus:border-[#53FC18] transition-colors text-white placeholder-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// EMAIL ADDRESS</span>
                <input
                  type="email"
                  placeholder="Email"
                  className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-bold uppercase outline-none focus:border-[#53FC18] transition-colors text-white placeholder-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* PROFILE SETTINGS */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Gamepad2 size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Profile Settings
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// FAVORITE TITLE</span>
                <input
                  type="text"
                  placeholder="Favorite Game"
                  className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-bold uppercase outline-none focus:border-[#53FC18] transition-colors text-white placeholder-zinc-700"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// COMPETITIVE RANK</span>
                <input
                  type="text"
                  placeholder="Game Rank"
                  className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-bold uppercase outline-none focus:border-[#53FC18] transition-colors text-white placeholder-zinc-700"
                />
              </div>
            </div>
          </div>

          {/* NOTIFICATION SETTINGS */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Bell size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Notification Settings
              </h2>
            </div>

            <div className="divide-y-2 divide-black/40 text-xs sm:text-sm font-bold uppercase tracking-wide">
              {[
                { id: "notify-friend", label: "Friend Request", desc: "Notifikasi saat seseorang menambahkanmu" },
                { id: "notify-party", label: "Party Invitation", desc: "Pemberitahuan undangan masuk skuad" },
                { id: "notify-tourney", label: "Tournament Updates", desc: "Update berkala kompetisi & event aktif" }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer group py-3.5 first:pt-0 last:pb-0 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="group-hover:text-[#53FC18] transition-colors">{item.label}</span>
                    <span className="text-[10px] font-medium text-zinc-500 tracking-normal normal-case">{item.desc}</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id={item.id}
                      defaultChecked 
                      className="peer h-5 w-5 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div className="h-5 w-5 border-2 border-black bg-[#191B1F] peer-checked:bg-[#53FC18] flex items-center justify-center transition-colors">
                      <Check size={12} className="text-black stroke-[4] scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* PRIVACY SETTINGS */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <ShieldCheck size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Privacy Settings
              </h2>
            </div>

            <div className="divide-y-2 divide-black/40 text-xs sm:text-sm font-bold uppercase tracking-wide">
              {[
                { id: "priv-online", label: "Show Online Status", desc: "Izinkan pengguna lain melihat status aktifmu" },
                { id: "priv-dm", label: "Allow Direct Messages", desc: "Buka fitur kirim pesan dari non-teman" },
                { id: "priv-seen", label: "Show Last Seen", desc: "Tampilkan jejak jam terakhir kali kamu login" }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between cursor-pointer group py-3.5 first:pt-0 last:pb-0 select-none">
                  <div className="flex flex-col gap-0.5">
                    <span className="group-hover:text-[#53FC18] transition-colors">{item.label}</span>
                    <span className="text-[10px] font-medium text-zinc-500 tracking-normal normal-case">{item.desc}</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      id={item.id}
                      defaultChecked 
                      className="peer h-5 w-5 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <div className="h-5 w-5 border-2 border-black bg-[#191B1F] peer-checked:bg-[#53FC18] flex items-center justify-center transition-colors">
                      <Check size={12} className="text-black stroke-[4] scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* MATCHMAKING PREFERENCES */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Layers size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Matchmaking Preferences
              </h2>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// DEFAULT GAME COMPONENT</span>
                <select className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-black uppercase outline-none focus:border-[#53FC18] transition-colors cursor-pointer text-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M2%204L6%208L10%204%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22square%22/%3E%3C/svg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat">
                  <option>All Games</option>
                  <option>Mobile Legends</option>
                  <option>Valorant</option>
                  <option>PUBG Mobile</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">// SERVER SERVER PREFERENCE</span>
                <select className="h-11 sm:h-12 w-full border-2 border-black bg-[#191B1F] px-4 text-xs sm:text-sm font-black uppercase outline-none focus:border-[#53FC18] transition-colors cursor-pointer text-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M2%204L6%208L10%204%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22square%22/%3E%3C/svg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat">
                  <option>All Regions</option>
                  <option>Indonesia</option>
                  <option>Singapore</option>
                  <option>Malaysia</option>
                </select>
              </div>
            </div>
          </div>

          {/* APPEARANCE */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <Monitor size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Appearance
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:w-auto border-2 border-black bg-[#53FC18] px-6 h-11 sm:h-12 text-xs sm:text-sm font-black text-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                Dark Mode
              </button>

              <button className="w-full sm:w-auto border-2 border-black bg-[#191B1F] px-6 h-11 sm:h-12 text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-zinc-300 hover:text-white">
                System Default
              </button>
            </div>
          </div>

          {/* SECURITY */}
          <div className="border-2 border-black bg-[#0E1318] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-zinc-400 mb-4">
              <KeyRound size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
                Security
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="w-full sm:w-auto border-2 border-black bg-[#53FC18] px-5 h-11 sm:h-12 text-xs sm:text-sm font-black text-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                Change Password
              </button>

              <button className="w-full sm:w-auto border-2 border-black bg-[#191B1F] px-5 h-11 sm:h-12 text-xs sm:text-sm font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-zinc-300 hover:text-white">
                Logout All Devices
              </button>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="border-2 border-red-600 bg-[#160B0B] p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-red-500 mb-3">
              <Trash2 size={18} className="shrink-0 stroke-[2.5]" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                Danger Zone
              </h2>
            </div>

            <p className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase leading-normal">
              Tindakan di bawah bersifat destruktif permanen dan tidak dapat dibatalkan dari sistem basis data.
            </p>

            <button className="mt-4 sm:mt-5 w-full sm:w-auto border-2 border-red-700 bg-red-600 hover:bg-red-500 px-6 h-11 sm:h-12 text-xs sm:text-sm font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              Delete Account
            </button>
          </div>

        </div>
      </section>
    </main>
  )
}

export default memo(SettingsContent)