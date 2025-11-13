export interface Message {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  subject: string
  content: string
  read: boolean
  attachments?: string[]
  createdAt: string
  updatedAt: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  participantNames: string[]
  lastMessage?: string
  lastMessageTime?: string
  unreadCount: number
}

// In-memory data store
export const messages: Message[] = [
  {
    id: "1",
    senderId: "john_001",
    senderName: "John Smith",
    recipientId: "alice_001",
    subject: "Internship Progress",
    content: "Hi Alice, how is your progress coming along? Please send me an update on your current projects.",
    read: true,
    createdAt: "2025-02-08",
    updatedAt: "2025-02-08",
  },
]

export function getMessagesByUser(userId: string): Message[] {
  return messages
    .filter((m) => m.recipientId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadMessages(userId: string): Message[] {
  return getMessagesByUser(userId).filter((m) => !m.read)
}

export function sendMessage(data: Omit<Message, "id" | "createdAt" | "updatedAt">): Message {
  const message: Message = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  messages.push(message)
  return message
}

export function markMessageAsRead(id: string): Message | undefined {
  const message = messages.find((m) => m.id === id)
  if (message) {
    message.read = true
    message.updatedAt = new Date().toISOString()
  }
  return message
}
