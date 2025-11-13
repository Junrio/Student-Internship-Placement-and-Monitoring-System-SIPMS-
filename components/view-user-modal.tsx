"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, Calendar, Shield } from "lucide-react"

interface UserDetails {
  id: number
  name: string
  email: string
  role: string
  phone: string | null
  dateJoined: string
  status: "Active" | "Inactive"
}

interface ViewUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number | null
}

export function ViewUserModal({ open, onOpenChange, userId }: ViewUserModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUser() {
      if (!userId || !open) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/admins/users/${userId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user details")
        }

        const data = await response.json()
        setUser(data.user)
      } catch (err: any) {
        console.error("Error fetching user:", err)
        setError(err.message || "Failed to load user details.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, open])

  const roleColors = {
    admin: "default",
    coordinator: "secondary",
    supervisor: "secondary",
    student: "outline",
  } as const

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View complete user information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <Badge
                    variant={roleColors[user.role as keyof typeof roleColors] || "outline"}
                    className="mt-1"
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                {user.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.dateJoined).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground">#{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



