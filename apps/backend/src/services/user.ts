import { insert, queryOne } from "../db/db.js"

export type GoogleUserInfo = {
  id: string
  email: string
  name: string
  given_name: string
  family_name: string
  picture: string
}

export type User = {
  id: number
  name: string
  family_name: string
  email: string
  google_id?: string
  avatar_url?: string
  date_of_birth?: string
  created_at?: string
  updated_at?: string
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const query = `
      SELECT id, name, family_name, username, email, google_id, avatar_url
      FROM users
      WHERE email = $1
      LIMIT 1
  `

  const user = await queryOne<User>(query, [email])
  return user ?? null
}

export async function createUser(userData: {
  name: string
  family_name: string
  email: string
  google_id: string
  avatar_url: string
}) {
  const id = await insert('users', userData)
  return { id, ...userData }
}


export async function getUserById(id: number) {
  const query = `
    SELECT id, name, family_name, username, email, google_id, avatar_url
    FROM users
    WHERE id = $1
    LIMIT 1
  `

  const user = await queryOne<User>(query, [id])
  return user ?? null
}

export async function updateUser(id: number, updates: Partial<{ name: string; family_name: string; date_of_birth: string }>) {
  const keys = Object.keys(updates)
  if (keys.length === 0) return null;

  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ')
  const values = [id, ...keys.map(key => (updates as any)[key])]

  const query = `
    UPDATE users
    SET ${setClause}
    WHERE id = $1
    RETURNING id, name, family_name, username, email, google_id, avatar_url, date_of_birth, created_at, updated_at
  `

  const updatedUser = await queryOne(query, values)
  return updatedUser
}
