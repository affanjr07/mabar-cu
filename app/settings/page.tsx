import Sidebar from "@/components/layout/Sidebar"

export default function SettingsPage() {
  return (
    <main className="flex min-h-screen bg-black text-white">

      <Sidebar />

      <section className="flex-1 p-10">

        <h1 className="text-5xl font-black">
          Settings
        </h1>

        <div className="mt-10 space-y-6">

          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">

            <h2 className="text-2xl font-bold">
              Account Settings
            </h2>

          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-6">

            <h2 className="text-2xl font-bold">
              Notification Settings
            </h2>

          </div>

        </div>

      </section>

    </main>
  )
}