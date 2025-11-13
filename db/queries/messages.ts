import { eq, and, desc, or } from "drizzle-orm"
import { db } from "../index"
import { messages, type Message, type NewMessage } from "../schema"

export async function getMessagesByUser(userId: number): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt))
}

export async function getUnreadMessages(userId: number): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .where(and(eq(messages.recipientId, userId), eq(messages.read, false)))
    .orderBy(desc(messages.createdAt))
}

export async function getMessageById(id: number): Promise<Message | null> {
  const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1)
  return result[0] || null
}

export async function createMessage(messageData: NewMessage): Promise<Message> {
  const result = await db.insert(messages).values(messageData).returning()
  return result[0]
}

export async function markMessageAsRead(id: number): Promise<Message | null> {
  const result = await db
    .update(messages)
    .set({ read: true, updatedAt: new Date() })
    .where(eq(messages.id, id))
    .returning()
  return result[0] || null
}

export async function getConversations(userId: number): Promise<Message[]> {
  // Get all messages where user is either sender or recipient
  return await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt))
}






