"use client"

import Sidebar from "@/components/layout/Sidebar"

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen bg-[#0B0E11] text-white">
      <Sidebar />

      <section className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="mb-8">
          <h1 className="text-5xl font-black uppercase tracking-tight">
            Settings
          </h1>

          <p className="mt-2 text-sm font-bold uppercase text-zinc-500">
            Kelola akun dan preferensi MABAR.CU kamu.
          </p>
        </div>

        <div className="grid gap-6">
          {/* ACCOUNT */}
          <div className="border-2 border-black bg-[#0E1318] p-6 shadow-[5px_5px_0px_0px_rgba(83,252,24,1)]">
            <h2 className="text-2xl font-black uppercase">
              Account Settings
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                placeholder="Username"
                className="h-12 border-2 border-black bg-[#191B1F] px-4 text-sm"
              />

              <input
                placeholder="Email"
                className="h-12 border-2 border-black bg-[#191B1F] px-4 text-sm"
              />
            </div>
          </div>

          {/* PROFILE */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Profile Settings
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                placeholder="Favorite Game"
                className="h-12 border-2 border-black bg-[#191B1F] px-4"
              />

              <input
                placeholder="Game Rank"
                className="h-12 border-2 border-black bg-[#191B1F] px-4"
              />
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Notification Settings
            </h2>

            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between">
                <span>Friend Request</span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="flex items-center justify-between">
                <span>Party Invitation</span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="flex items-center justify-between">
                <span>Tournament Updates</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>

          {/* PRIVACY */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Privacy Settings
            </h2>

            <div className="mt-5 space-y-4">
              <label className="flex items-center justify-between">
                <span>Show Online Status</span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="flex items-center justify-between">
                <span>Allow Direct Messages</span>
                <input type="checkbox" defaultChecked />
              </label>

              <label className="flex items-center justify-between">
                <span>Show Last Seen</span>
                <input type="checkbox" defaultChecked />
              </label>
            </div>
          </div>

          {/* MATCHMAKING */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Matchmaking Preferences
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select className="h-12 border-2 border-black bg-[#191B1F] px-4">
                <option>All Games</option>
                <option>Mobile Legends</option>
                <option>Valorant</option>
                <option>PUBG Mobile</option>
              </select>

              <select className="h-12 border-2 border-black bg-[#191B1F] px-4">
                <option>All Regions</option>
                <option>Indonesia</option>
                <option>Singapore</option>
                <option>Malaysia</option>
              </select>
            </div>
          </div>

          {/* APPEARANCE */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Appearance
            </h2>

            <div className="mt-5 flex gap-4">
              <button className="border-2 border-black bg-[#53FC18] px-6 py-3 font-black text-black">
                Dark Mode
              </button>

              <button className="border-2 border-black bg-[#191B1F] px-6 py-3 font-black">
                System
              </button>
            </div>
          </div>

          {/* SECURITY */}
          <div className="border-2 border-black bg-[#0E1318] p-6">
            <h2 className="text-2xl font-black uppercase">
              Security
            </h2>

            <div className="mt-5 flex flex-wrap gap-4">
              <button className="border-2 border-black bg-[#53FC18] px-5 py-3 font-black text-black">
                Change Password
              </button>

              <button className="border-2 border-black bg-[#191B1F] px-5 py-3 font-black">
                Logout All Devices
              </button>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="border-2 border-red-600 bg-red-950/20 p-6">
            <h2 className="text-2xl font-black uppercase text-red-500">
              Danger Zone
            </h2>

            <p className="mt-3 text-sm text-zinc-400">
              Tindakan di bawah tidak dapat dibatalkan.
            </p>

            <button className="mt-5 border-2 border-red-700 bg-red-600 px-6 py-3 font-black uppercase">
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}