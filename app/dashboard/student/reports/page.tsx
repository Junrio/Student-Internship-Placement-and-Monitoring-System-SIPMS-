"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Log {
  id: number
  date: string
  title: string
  content: string
  status: string
  submittedAt: string | null
  reviewedAt: string | null
}

export default function StudentReports() {
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newLog, setNewLog] = useState({ title: "", content: "", date: "" })

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/students/reports")

      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }

      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err) {
      console.error("Error fetching logs:", err)
      setError("Failed to load logs. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateLog = async () => {
    try {
      if (!newLog.title || !newLog.content || !newLog.date) {
        toast.error("Please fill in all fields")
        return
      }

      const response = await fetch("/api/students/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      })

      if (!response.ok) {
        throw new Error("Failed to create log")
      }

      toast.success("Log created successfully")
      setCreateModalOpen(false)
      setNewLog({ title: "", content: "", date: "" })
      fetchLogs()
    } catch (err) {
      console.error("Error creating log:", err)
      toast.error("Failed to create log")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "reviewed":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Reviewed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Logs</h1>
          <p className="text-muted-foreground">Track your progress and submit reports</p>
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
          <h1 className="text-3xl font-bold text-foreground">Reports & Logs</h1>
          <p className="text-muted-foreground">Track your progress and submit reports</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Log
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Logs Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Start tracking your internship progress by creating your first log entry. Document your daily
                activities, learnings, and achievements.
              </p>
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Log
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{log.title}</CardTitle>
                    <CardDescription>
                      {new Date(log.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(log.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  {log.submittedAt && (
                    <span>Submitted: {new Date(log.submittedAt).toLocaleDateString()}</span>
                  )}
                  {log.reviewedAt && (
                    <span>Reviewed: {new Date(log.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Log Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Log Entry</DialogTitle>
            <DialogDescription>Document your daily activities and progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Week 1 - Introduction to Company"
                value={newLog.title}
                onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Describe your activities, learnings, and achievements..."
                rows={6}
                value={newLog.content}
                onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLog}>Create Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}






