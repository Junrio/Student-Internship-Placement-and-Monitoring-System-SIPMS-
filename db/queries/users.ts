import { eq, and, desc } from "drizzle-orm"
import bcrypt from "bcrypt"
import { db } from "../index"
import { users, type User, type NewUser } from "../schema"

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0] || null
}

export async function getUserByUserId(userId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.userId, userId)).limit(1)
  return result[0] || null
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return result[0] || null
}

export async function createUser(userData: NewUser): Promise<User> {
  const result = await db.insert(users).values(userData).returning()
  return result[0]
}

export async function updateUser(id: number, userData: Partial<NewUser>): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return result[0] || null
}

export async function getUsersByRole(role: "student" | "coordinator" | "supervisor" | "admin"): Promise<User[]> {
  return await db
    .select()
    .from(users)
    .where(eq(users.role, role))
    .orderBy(desc(users.createdAt))
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  
  // Compare password with bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (isPasswordValid) {
    return user
  }
  return null
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

