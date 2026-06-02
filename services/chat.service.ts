import { api } from "@/lib/axios"

export async function getChatMessages(chatId: string) {
  const res = await api.get(`/chats/${chatId}/messages`)
  return res.data
}

export async function sendChatMessage(
  chatId: string,
  data: {
    content?: string
    image_url?: string
    sticker_url?: string
    message_type?: "text" | "image" | "sticker"
  }
) {
  const res = await api.post(`/chats/${chatId}/messages`, data)
  return res.data
}

export async function createPrivateChat(targetUserId: string) {
  const res = await api.post("/chats/private", {
    targetUserId,
  })

  return res.data
}

export async function markChatMessagesAsRead(chatId: string) {
  const res = await api.patch(`/chats/${chatId}/read`)
  return res.data
}

export async function getRoomChatMessages(roomId: string) {
  const res = await api.get(`/chats/rooms/${roomId}/messages`)
  return res.data
}

export async function sendRoomChatMessage(roomId: string, content: string) {
  const res = await api.post(`/chats/rooms/${roomId}/messages`, {
    content,
  })

  return res.data
}