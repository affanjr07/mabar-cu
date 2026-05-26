import { api } from "@/lib/axios"

export async function getMyWallet() {
  const res = await api.get("/economy/wallet/me")
  return res.data
}

export async function topUpDemo(amount: number) {
  const res = await api.post("/economy/wallet/topup-demo", { amount })
  return res.data
}

export async function giftPoints(data: {
  target_email: string
  amount: number
  message?: string
}) {
  const res = await api.post("/economy/wallet/gift", data)
  return res.data
}

export async function getShopItems(type?: string) {
  const res = await api.get("/economy/shop/items", {
    params: { type: type || undefined },
  })
  return res.data
}

export async function buyShopItem(item_id: string) {
  const res = await api.post("/economy/shop/buy", { item_id })
  return res.data
}

export async function getMyInventory() {
  const res = await api.get("/economy/inventory/me")
  return res.data
}

export async function equipItem(inventoryId: string) {
  const res = await api.patch(`/economy/inventory/${inventoryId}/equip`)
  return res.data
}

export async function getWalletTransactions() {
  const res = await api.get("/economy/wallet/transactions")
  return res.data
}