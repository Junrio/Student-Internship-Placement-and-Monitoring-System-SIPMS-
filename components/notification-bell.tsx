"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getNotificationsByUser, markNotificationAsRead } from "@/lib/notification-module"
import type { Notification } from "@/lib/notification-module"

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    // Load notifications
    setNotifications(getNotificationsByUser(userId))
  }, [userId])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "message":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
            {unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Notifications</CardTitle>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-secondary rounded">
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    notification.read ? "bg-background hover:bg-secondary/50" : "bg-primary/10 hover:bg-primary/20"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${getNotificationColor(notification.type)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
