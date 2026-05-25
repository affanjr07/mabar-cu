import { api } from "@/lib/axios"

export async function getCommunityChannels(gameId?: string) {
  const res = await api.get("/community/channels", {
    params: {
      gameId: gameId || undefined,
    },
  })

  return res.data
}

export async function getCommunityMessages(channelId: string) {
  const res = await api.get(`/community/channels/${channelId}/messages`)
  return res.data
}

export async function sendCommunityMessage(channelId: string, content: string) {
  const res = await api.post(`/community/channels/${channelId}/messages`, {
    content,
  })

  return res.data
}