import { Request, Response } from "express"
import { supabase } from "../config/supabase"

function generateRoomCode() {
  return `MBAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

async function attachEquippedItemsToMembers(members: any[]) {
  const ids = members.map((m) => m.user_id).filter(Boolean)
  if (ids.length === 0) return members

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      avatar_url,
      online_status,
      last_online,
      role
    `)
    .in("id", ids)

  const { data: equippedItems } = await supabase
    .from("user_inventory")
    .select(`
      user_id,
      is_equipped,
      shop_items (
        id,
        name,
        type,
        image_url,
        rarity,
        css_class,
        metadata
      )
    `)
    .in("user_id", ids)
    .eq("is_equipped", true)

  return members.map((member) => {
    const profile = profiles?.find((p: any) => p.id === member.user_id)

    const items =
      equippedItems?.filter((item: any) => item.user_id === member.user_id) ||
      []

    return {
      ...member,
      profiles: profile
        ? {
            ...profile,
            equipped_avatar_border:
              items.find(
                (item: any) => item.shop_items?.type === "avatar_border"
              )?.shop_items || null,
            equipped_badges:
              items
                .filter((item: any) => item.shop_items?.type === "badge")
                .map((item: any) => item.shop_items) || [],
          }
        : null,
    }
  })
}

async function hydrateRooms(rooms: any[]) {
  if (rooms.length === 0) return []

  const roomIds = rooms.map((room) => room.id)

  const { data: members } = await supabase
    .from("party_members")
    .select(`
      id,
      party_room_id,
      user_id,
      role_in_game,
      is_owner,
      is_ready,
      joined_at
    `)
    .in("party_room_id", roomIds)
    .order("joined_at", { ascending: true })

  const hydratedMembers = await attachEquippedItemsToMembers(members || [])

  return rooms.map((room) => ({
    ...room,
    party_members: hydratedMembers.filter(
      (member) => member.party_room_id === room.id
    ),
  }))
}

async function userHasActiveRoom(userId: string) {
  const { data } = await supabase
    .from("party_members")
    .select(`
      id,
      party_room_id,
      party_rooms (
        id,
        status
      )
    `)
    .eq("user_id", userId)

  const active = (data || []).find((item: any) => {
    const room = Array.isArray(item.party_rooms)
      ? item.party_rooms[0]
      : item.party_rooms

    return room?.status === "open"
  })

  return active || null
}

async function updateMissingRoles(roomId: string) {
  const { data: room } = await supabase
    .from("party_rooms")
    .select(`
      id,
      game_id,
      missing_roles,
      games (
        id,
        roles
      )
    `)
    .eq("id", roomId)
    .single()

  if (!room) return

  const game = Array.isArray(room.games) ? room.games[0] : room.games
  const baseRoles = game?.roles || room.missing_roles || []

  if (!baseRoles || baseRoles.length === 0) return

  const { data: members } = await supabase
    .from("party_members")
    .select("role_in_game")
    .eq("party_room_id", roomId)

  const takenRoles = (members || [])
    .map((m) => m.role_in_game)
    .filter(Boolean)

  const missingRoles = baseRoles.filter((role: string) => !takenRoles.includes(role))

  await supabase
    .from("party_rooms")
    .update({
      missing_roles: missingRoles,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)
}

export async function searchPartyRooms(req: Request, res: Response) {
  const { gameId, role, rank, region } = req.query

  let query = supabase
    .from("party_rooms")
    .select(`
      id,
      owner_id,
      game_id,
      chat_id,
      title,
      description,
      room_type,
      invite_code,
      game_mode,
      target_rank,
      region,
      max_players,
      status,
      missing_roles,
      average_rank,
      created_at,
      updated_at,
      room_code,
      owner_left_at,
      cooldown_until,
      closed_at,
      expires_at,
      games (
        id,
        name,
        genre,
        max_party_size,
        roles,
        ranks
      )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })

  if (gameId) query = query.eq("game_id", gameId)
  if (rank) query = query.eq("target_rank", rank)
  if (region) query = query.ilike("region", `%${region}%`)
  if (role) query = query.contains("missing_roles", [String(role)])

  const { data, error } = await query

  if (error) {
    return res.status(400).json({
      message: error.message,
    })
  }

  const now = Date.now()

  const activeRooms = (data || []).filter((room: any) => {
    if (!room.expires_at) return true
    return new Date(room.expires_at).getTime() > now
  })

  return res.json(await hydrateRooms(activeRooms))
}

export async function createPartyRoom(req: Request, res: Response) {
  const userId = req.user.id

  const {
    game_id,
    title,
    description,
    room_type = "public",
    game_mode = "Ranked",
    target_rank = "Casual",
    region = "Indonesia",
    max_players,
    selected_role,
    required_roles,
  } = req.body

  if (!title?.trim()) {
    return res.status(400).json({
      message: "Judul party wajib diisi",
    })
  }

  const activeRoom = await userHasActiveRoom(userId)

  if (activeRoom) {
    return res.status(400).json({
      code: "ACTIVE_ROOM_EXISTS",
      message: "Kamu sudah berada di room lain. Keluar dulu untuk membuat room baru.",
    })
  }

  let game: any = null

  if (game_id) {
    const { data } = await supabase
      .from("games")
      .select("id, name, max_party_size, roles, ranks")
      .eq("id", game_id)
      .maybeSingle()

    game = data
  }

  const finalMaxPlayers =
    Number(max_players) || Number(game?.max_party_size) || 5

  const roles =
    Array.isArray(required_roles) && required_roles.length > 0
      ? required_roles
      : Array.isArray(game?.roles)
        ? game.roles
        : []

  const ownerRole = selected_role || roles[0] || "Flex"

  const missingRoles = roles.length
    ? roles.filter((role: string) => role !== ownerRole)
    : []

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .insert({
      type: "party",
    })
    .select()
    .single()

  if (chatError) {
    return res.status(400).json({
      message: chatError.message,
    })
  }

  const { data: room, error } = await supabase
    .from("party_rooms")
    .insert({
      owner_id: userId,
      game_id: game_id || null,
      chat_id: chat.id,
      title: title.trim(),
      description: description || null,
      room_type,
      room_code: room_type === "private" ? generateRoomCode() : null,
      game_mode,
      target_rank,
      average_rank: target_rank,
      region,
      max_players: finalMaxPlayers,
      status: "open",
      missing_roles: missingRoles,
      expires_at: expiresAt,
    })
    .select(`
      id,
      owner_id,
      game_id,
      chat_id,
      title,
      description,
      room_type,
      invite_code,
      game_mode,
      target_rank,
      region,
      max_players,
      status,
      missing_roles,
      average_rank,
      created_at,
      updated_at,
      room_code,
      owner_left_at,
      cooldown_until,
      closed_at,
      expires_at,
      games (
        id,
        name,
        genre,
        max_party_size,
        roles,
        ranks
      )
    `)
    .single()

  if (error) {
    return res.status(400).json({
      message: error.message,
    })
  }

  const { error: memberError } = await supabase.from("party_members").insert({
    party_room_id: room.id,
    user_id: userId,
    role_in_game: ownerRole,
    is_owner: true,
    is_ready: false,
  })

  if (memberError) {
    return res.status(400).json({
      message: memberError.message,
    })
  }

  await supabase.from("chat_participants").insert({
    chat_id: chat.id,
    user_id: userId,
  })

  return res.status(201).json({
    message: "Party room berhasil dibuat",
    room: (await hydrateRooms([room]))[0],
  })
}

export async function joinPartyRoom(req: Request, res: Response) {
  const userId = req.user.id
  const { roomId } = req.params
  const { role_in_game } = req.body

  if (!roomId) {
    return res.status(400).json({
      message: "roomId wajib diisi",
    })
  }

  const activeRoom = await userHasActiveRoom(userId)

  if (activeRoom) {
    return res.status(400).json({
      code: "ACTIVE_ROOM_EXISTS",
      message: "Kamu sudah berada di room lain. Keluar dulu untuk join room baru.",
    })
  }

  const { data: room, error: roomError } = await supabase
    .from("party_rooms")
    .select(`
      id,
      owner_id,
      chat_id,
      room_type,
      max_players,
      status,
      missing_roles,
      expires_at
    `)
    .eq("id", roomId)
    .single()

  if (roomError || !room) {
    return res.status(404).json({
      message: "Room tidak ditemukan",
    })
  }

  if (room.status !== "open") {
    return res.status(400).json({
      message: "Room sudah tidak open",
    })
  }

  if (room.expires_at && new Date(room.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("party_rooms")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    return res.status(400).json({
      message: "Room sudah expired",
    })
  }

  if (room.room_type === "private") {
    return res.status(403).json({
      message: "Private room harus join lewat room code",
    })
  }

  const { count } = await supabase
    .from("party_members")
    .select("id", { count: "exact", head: true })
    .eq("party_room_id", roomId)

  if ((count || 0) >= room.max_players) {
    return res.status(400).json({
      message: "Room sudah penuh",
    })
  }

  const selectedRole = role_in_game || room.missing_roles?.[0] || "Flex"

  const { error } = await supabase.from("party_members").insert({
    party_room_id: roomId,
    user_id: userId,
    role_in_game: selectedRole,
    is_owner: false,
    is_ready: false,
  })

  if (error) {
    return res.status(400).json({
      message: error.message,
    })
  }

  await supabase.from("chat_participants").insert({
    chat_id: room.chat_id,
    user_id: userId,
  })

  await updateMissingRoles(roomId)

  return res.json({
    message: "Berhasil join party room",
  })
}

export async function joinPartyRoomByCode(req: Request, res: Response) {
  const userId = req.user.id
  const { roomCode, role_in_game } = req.body

  if (!roomCode) {
    return res.status(400).json({
      message: "roomCode wajib diisi",
    })
  }

  const activeRoom = await userHasActiveRoom(userId)

  if (activeRoom) {
    return res.status(400).json({
      code: "ACTIVE_ROOM_EXISTS",
      message: "Kamu sudah berada di room lain. Keluar dulu untuk join room baru.",
    })
  }

  const { data: room, error: roomError } = await supabase
    .from("party_rooms")
    .select(`
      id,
      owner_id,
      chat_id,
      room_type,
      max_players,
      status,
      missing_roles,
      expires_at
    `)
    .eq("room_code", roomCode)
    .single()

  if (roomError || !room) {
    return res.status(404).json({
      message: "Room code tidak ditemukan",
    })
  }

  if (room.status !== "open") {
    return res.status(400).json({
      message: "Room sudah tidak open",
    })
  }

  if (room.expires_at && new Date(room.expires_at).getTime() <= Date.now()) {
    await supabase
      .from("party_rooms")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", room.id)

    return res.status(400).json({
      message: "Room sudah expired",
    })
  }

  const { count } = await supabase
    .from("party_members")
    .select("id", { count: "exact", head: true })
    .eq("party_room_id", room.id)

  if ((count || 0) >= room.max_players) {
    return res.status(400).json({
      message: "Room sudah penuh",
    })
  }

  const selectedRole = role_in_game || room.missing_roles?.[0] || "Flex"

  const { error } = await supabase.from("party_members").insert({
    party_room_id: room.id,
    user_id: userId,
    role_in_game: selectedRole,
    is_owner: false,
    is_ready: false,
  })

  if (error) {
    return res.status(400).json({
      message: error.message,
    })
  }

  await supabase.from("chat_participants").insert({
    chat_id: room.chat_id,
    user_id: userId,
  })

  await updateMissingRoles(room.id)

  return res.json({
    message: "Berhasil join private room",
  })
}

export async function leavePartyRoom(req: Request, res: Response) {
  const userId = req.user.id
  const { roomId } = req.params

  if (!roomId) {
    return res.status(400).json({
      message: "roomId wajib diisi",
    })
  }

  const { data: member, error: memberError } = await supabase
    .from("party_members")
    .select("id, is_owner")
    .eq("party_room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle()

  if (memberError) {
    return res.status(400).json({
      message: memberError.message,
    })
  }

  if (!member) {
    return res.status(404).json({
      message: "Kamu bukan member room ini",
    })
  }

  const { data: room } = await supabase
    .from("party_rooms")
    .select("id, chat_id")
    .eq("id", roomId)
    .single()

  await supabase
    .from("party_members")
    .delete()
    .eq("party_room_id", roomId)
    .eq("user_id", userId)

  if (room?.chat_id) {
    await supabase
      .from("chat_participants")
      .delete()
      .eq("chat_id", room.chat_id)
      .eq("user_id", userId)
  }

  const { data: remainingMembers } = await supabase
    .from("party_members")
    .select("id, user_id, joined_at")
    .eq("party_room_id", roomId)
    .order("joined_at", { ascending: true })

  if (!remainingMembers || remainingMembers.length === 0) {
    await supabase
      .from("party_rooms")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    return res.json({
      message: "Keluar room. Room ditutup karena kosong.",
    })
  }

  if (member.is_owner) {
    const nextOwner = remainingMembers[0]

    await supabase
      .from("party_rooms")
      .update({
        owner_id: nextOwner.user_id,
        owner_left_at: new Date().toISOString(),
        cooldown_until: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    await supabase
      .from("party_members")
      .update({
        is_owner: true,
      })
      .eq("id", nextOwner.id)
  }

  await updateMissingRoles(roomId)

  return res.json({
    message: "Berhasil keluar dari room",
  })
}

export async function transferRoomOwnership(req: Request, res: Response) {
  const userId = req.user.id
  const { roomId } = req.params
  const { targetUserId } = req.body

  if (!roomId || !targetUserId) {
    return res.status(400).json({
      message: "roomId dan targetUserId wajib diisi",
    })
  }

  const { data: room } = await supabase
    .from("party_rooms")
    .select("id, owner_id")
    .eq("id", roomId)
    .single()

  if (!room) {
    return res.status(404).json({
      message: "Room tidak ditemukan",
    })
  }

  if (room.owner_id !== userId) {
    return res.status(403).json({
      message: "Hanya owner yang bisa transfer room",
    })
  }

  const { data: targetMember } = await supabase
    .from("party_members")
    .select("id")
    .eq("party_room_id", roomId)
    .eq("user_id", targetUserId)
    .maybeSingle()

  if (!targetMember) {
    return res.status(404).json({
      message: "Target bukan member room",
    })
  }

  await supabase
    .from("party_members")
    .update({ is_owner: false })
    .eq("party_room_id", roomId)

  await supabase
    .from("party_members")
    .update({ is_owner: true })
    .eq("party_room_id", roomId)
    .eq("user_id", targetUserId)

  await supabase
    .from("party_rooms")
    .update({
      owner_id: targetUserId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", roomId)

  return res.json({
    message: "Owner room berhasil dipindahkan",
  })
}

export async function closeExpiredCooldownRooms(req: Request, res: Response) {
  const now = new Date().toISOString()

  const { data: expiredRooms, error } = await supabase
    .from("party_rooms")
    .select("id")
    .eq("status", "open")
    .or(`expires_at.lte.${now},cooldown_until.lte.${now}`)

  if (error) {
    return res.status(400).json({
      message: error.message,
    })
  }

  const ids = (expiredRooms || []).map((room) => room.id)

  if (ids.length > 0) {
    await supabase
      .from("party_rooms")
      .update({
        status: "closed",
        closed_at: now,
      })
      .in("id", ids)
  }

  return res.json({
    message: "Expired/cooldown rooms berhasil dicek",
    closed_count: ids.length,
  })
}