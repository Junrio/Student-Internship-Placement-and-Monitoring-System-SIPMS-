"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Send, Mail } from "lucide-react"
import { getMessagesByUser, getUnreadMessages, markMessageAsRead, sendMessage } from "@/lib/messaging-module"
import type { Message } from "@/lib/messaging-module"

interface MessagingPanelProps {
  userId: string
  userName: string
}

export function MessagingPanel({ userId, userName }: MessagingPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // Load messages
    setMessages(getMessagesByUser(userId))
  }, [userId])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Omit<Message, "id" | "createdAt" | "updatedAt"> = {
      senderId: userId,
      senderName: userName,
      recipientId: selectedMessage?.senderId || "",
      subject: `Re: ${selectedMessage?.subject || "Message"}`,
      content: newMessage,
      read: false,
    }

    const created = sendMessage(message)
    setMessages((prev) => [created, ...prev])
    setNewMessage("")
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadCount = getUnreadMessages(userId).length

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-screen max-h-96 lg:max-h-full">
      {/* Messages List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Messages
          </CardTitle>
          {unreadCount > 0 && <Badge className="w-fit">{unreadCount} Unread</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMessages.map((message) => (
              <button
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.read) {
                    markMessageAsRead(message.id)
                    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)))
                  }
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedMessage?.id === message.id
                    ? "bg-primary text-primary-foreground"
                    : message.read
                      ? "bg-background hover:bg-secondary"
                      : "bg-primary/10 hover:bg-primary/20"
                }`}
              >
                <p className="font-medium text-sm truncate">{message.senderName}</p>
                <p className="text-xs truncate">{message.subject}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Message Detail */}
      <Card className="lg:col-span-2">
        {selectedMessage ? (
          <>
            <CardHeader>
              <CardTitle>{selectedMessage.subject}</CardTitle>
              <CardDescription>From: {selectedMessage.senderName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg min-h-32">
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <p className="text-sm font-medium">Reply</p>
                <textarea
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-2 border border-input rounded-md min-h-20 font-sans"
                />
                <Button onClick={handleSendMessage} className="gap-2" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full min-h-48">
            <p className="text-muted-foreground">Select a message to view details</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
