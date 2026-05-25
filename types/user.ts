export interface User {
  id: string
  username: string
  email: string
  avatar: string
  role: "user" | "admin" | "pro_player"
}