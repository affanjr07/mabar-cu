import { api } from "@/lib/axios"

export async function getProChatMessages(chatId: string) {
  const res = await api.get(`/pro-chats/${chatId}/messages`)
  return res.data
}

export async function sendProChatMessage(chatId: string, message: string) {
  const res = await api.post(`/pro-chats/${chatId}/messages`, {
    message,
  })
  return res.data
}