"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  UserX,
  Plus,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreateUserModal } from "@/components/create-user-modal"
import { ViewUserModal } from "@/components/view-user-modal"
import { EditUserModal } from "@/components/edit-user-modal"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: number
  name: string
  email: string
  role: string
  dateJoined: string
  status?: "Active" | "Inactive"
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const roleColors = {
  admin: "default",
  coordinator: "secondary",
  supervisor: "secondary",
  student: "outline",
} as const

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const fetchUsers = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (roleFilter !== "all") {
        params.append("role", roleFilter)
      }

      if (searchQuery) {
        params.append("search", searchQuery)
      }

      const response = await fetch(`/api/admins/users?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      // Add status field (default to Active for now)
      const usersWithStatus = (data.users || []).map((user: User) => ({
        ...user,
        status: user.status || "Active",
      }))
      setUsers(usersWithStatus)
      setPagination(data.pagination || pagination)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError("Failed to load users. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [roleFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || roleFilter !== "all") {
        fetchUsers(1)
      } else {
        fetchUsers(1)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage system users and permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage system users and permissions</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and permissions • Total: {pagination.total} users
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="coordinator">Coordinator</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery || roleFilter !== "all"
                  ? "No users match your search criteria. Try adjusting your filters."
                  : "No users have been registered yet. Users will appear here once they sign up."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={roleColors[user.role as keyof typeof roleColors] || "outline"}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.dateJoined)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setViewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setEditModalOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (confirm(`Are you sure you want to ${user.status === "Active" ? "deactivate" : "activate"} this user?`)) {
                                try {
                                  const response = await fetch(`/api/admins/users/${user.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      status: user.status === "Active" ? "Inactive" : "Active",
                                    }),
                                  })
                                  if (response.ok) {
                                    toast.success(`User ${user.status === "Active" ? "deactivated" : "activated"} successfully`)
                                    fetchUsers(pagination.page)
                                  } else {
                                    throw new Error("Failed to update user status")
                                  }
                                } catch (err) {
                                  toast.error("Failed to update user status")
                                }
                              }
                            }}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {error && users.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          fetchUsers(pagination.page)
        }}
      />
      <ViewUserModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        userId={selectedUserId}
      />
      <EditUserModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        userId={selectedUserId}
        onSuccess={() => {
          fetchUsers(pagination.page)
        }}
      />
    </div>
  )
}
