const notifications = [
  "ShadowHunter invited you to a party",
  "Tournament starts in 1 hour",
  "Zenitsu followed you",
]

export default function NotificationDropdown() {
  return (
    <div className="absolute right-0 top-16 w-96 rounded-3xl border border-white/10 bg-[#0d0d0d] p-4">

      <h2 className="mb-4 text-xl font-black">
        Notifications
      </h2>

      <div className="space-y-3">

        {notifications.map((notif) => (
          <div
            key={notif}
            className="rounded-2xl bg-white/5 p-4"
          >

            {notif}

          </div>
        ))}

      </div>

    </div>
  )
}