import { api } from "@/lib/axios"

export async function getMyProfile() {
  const res = await api.get("/profile/me")
  return res.data
}

export async function getPublicProfile(identifier: string) {
  const res = await api.get(`/profile/public/${identifier}`)
  return res.data
}

export async function updateMyProfile(data: any) {
  const res = await api.put("/profile/me", data)
  return res.data
}

export async function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append("image", file)

  const res = await api.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}

export async function uploadBanner(file: File) {
  const formData = new FormData()
  formData.append("image", file)

  const res = await api.post("/upload/banner", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return res.data
}