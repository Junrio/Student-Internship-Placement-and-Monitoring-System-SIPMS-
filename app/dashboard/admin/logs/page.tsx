"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface AuditLog {
  id: string
  timestamp: Date
  action: string
  description: string
  adminId?: number
  adminName?: string
  metadata?: any
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const actionColors: Record<string, string> = {
  user_created: "default",
  internship_created: "secondary",
  evaluation_submitted: "outline",
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  })

  const fetchLogs = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (actionFilter !== "all") {
        params.append("action", actionFilter)
      }

      if (timeFilter !== "all") {
        params.append("timeFilter", timeFilter)
      }

      const response = await fetch(`/api/admins/logs?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch audit logs")
      const data = await response.json()
      setLogs(data.logs || [])
      setPagination(data.pagination || pagination)
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError("Failed to load audit logs. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1)
  }, [actionFilter, timeFilter])

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage)
  }

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleExport = () => {
    // In a real implementation, this would generate and download a CSV/PDF
    toast.info("Export functionality coming soon")
  }

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">System activity and event tracking</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground">
            System activity and event tracking • Total: {pagination.total} logs
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user_created">User Created</SelectItem>
            <SelectItem value="internship_created">Internship Created</SelectItem>
            <SelectItem value="evaluation_submitted">Evaluation Submitted</SelectItem>
            <SelectItem value="settings_changed">Settings Changed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs List */}
      {logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Audit Logs Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {actionFilter !== "all"
                  ? "No logs match your filter criteria. Try selecting a different action type."
                  : "No system activity has been logged yet. Logs will appear here as users interact with the system."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Chronological list of all system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            (actionColors[log.action] as any) || "outline"
                          }
                        >
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.description}</p>
                      {log.metadata && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {JSON.stringify(log.metadata, null, 2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} logs
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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

