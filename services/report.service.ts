import { api } from "@/lib/axios"

export async function createReport(data: {
  title: string
  description: string
}) {
  const res = await api.post("/reports", data)
  return res.data
}

export async function getMyActiveReport() {
  const res = await api.get("/reports/me/active")
  return res.data
}

export async function getReportMessages(reportId: string) {
  const res = await api.get(`/reports/${reportId}/messages`)
  return res.data
}

export async function sendReportMessage(reportId: string, message: string) {
  const res = await api.post(`/reports/${reportId}/messages`, {
    message,
  })

  return res.data
}

export async function closeReport(reportId: string) {
  const res = await api.patch(`/reports/${reportId}/close`)
  return res.data
}