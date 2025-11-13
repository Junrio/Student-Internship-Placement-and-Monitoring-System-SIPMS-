export type NotificationType = "info" | "warning" | "success" | "error" | "message"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  read: boolean
  createdAt: string
}

// In-memory data store
export const notifications: Notification[] = [
  {
    id: "1",
    userId: "alice_001",
    type: "info",
    title: "Evaluation Due",
    message: "Your mid-term evaluation is scheduled for tomorrow at 2 PM.",
    actionUrl: "/dashboard/student/evaluations",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    userId: "alice_001",
    type: "success",
    title: "Attendance Recorded",
    message: "Your attendance for today has been recorded.",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function getNotificationsByUser(userId: string): Notification[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getUnreadNotifications(userId: string): Notification[] {
  return getNotificationsByUser(userId).filter((n) => !n.read)
}

export function createNotification(data: Omit<Notification, "id" | "createdAt">): Notification {
  const notification: Notification = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  notifications.push(notification)
  return notification
}

export function markNotificationAsRead(id: string): Notification | undefined {
  const notification = notifications.find((n) => n.id === id)
  if (notification) {
    notification.read = true
  }
  return notification
}

export function markAllAsRead(userId: string): void {
  notifications
    .filter((n) => n.userId === userId && !n.read)
    .forEach((n) => {
      n.read = true
    })
}
