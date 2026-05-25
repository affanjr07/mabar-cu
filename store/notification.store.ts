import { create } from "zustand"

interface NotificationItem {
  id: string
  type: string
  title: string
  message?: string
  is_read: boolean
  created_at: string
  data?: any
}

interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  setNotifications: (items: NotificationItem[]) => void
  addNotification: (item: NotificationItem) => void
  markAsRead: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (items) =>
    set({
      notifications: items,
      unreadCount: items.filter((item) => !item.is_read).length,
    }),

  addNotification: (item) =>
    set((state) => ({
      notifications: [item, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )

      return {
        notifications,
        unreadCount: notifications.filter((item) => !item.is_read).length,
      }
    }),
}))