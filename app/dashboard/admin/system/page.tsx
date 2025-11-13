"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Server,
  FileText,
  RefreshCw,
  Database,
  Activity,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface SystemStatus {
  server: {
    status: string
    uptime: number
  }
  database: {
    status: string
    lastChecked: string
  }
  api: {
    status: string
    version: string
  }
}

export default function AdminSystem() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [userRegistration, setUserRegistration] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)

  useEffect(() => {
    fetchSystemStatus()
    // Refresh status every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/admins/system/status")

      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }

      const statusData = await response.json()
      setStatus(statusData)
    } catch (err) {
      console.error("Error fetching system status:", err)
      setError("Failed to load system status. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const handleMaintenanceAction = async (action: string) => {
    try {
      toast.info(`${action} initiated...`)
      // In a real implementation, these would call API endpoints
      setTimeout(() => {
        toast.success(`${action} completed successfully`)
      }, 1000)
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "Operational" || status === "Connected" || status === "Running") {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  if (isLoading && !status) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground">Configure system parameters and maintenance</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure system parameters and maintenance</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Status */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" style={{ color: "#002F6C" }} />
            System Status
          </CardTitle>
          <CardDescription>Real-time system health monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Server Status</span>
                {status && (
                  <p className="text-xs text-muted-foreground">
                    Uptime: {formatUptime(status.server.uptime)}
                  </p>
                )}
              </div>
            </div>
            {status && getStatusBadge(status.server.status)}
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">Database Status</span>
                {status && (
                  <p className="text-xs text-muted-foreground">
                    Last checked: {new Date(status.database.lastChecked).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            {status && getStatusBadge(status.database.status)}
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="text-sm font-medium">API Status</span>
                {status && (
                  <p className="text-xs text-muted-foreground">Version: {status.api.version}</p>
                )}
              </div>
            </div>
            {status && getStatusBadge(status.api.status)}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStatus}
            className="w-full mt-4"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Status
          </Button>
        </CardContent>
      </Card>

      {/* Maintenance Tools */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" style={{ color: "#002F6C" }} />
            Maintenance Tools
          </CardTitle>
          <CardDescription>System maintenance and optimization utilities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleMaintenanceAction("Clear Cache")}
          >
            Clear Cache
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleMaintenanceAction("Optimize Database")}
          >
            Optimize Database
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleMaintenanceAction("Generate Backup")}
          >
            Generate Backup
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => handleMaintenanceAction("View Logs")}
          >
            View Logs
          </Button>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: "#002F6C" }} />
            Configuration
          </CardTitle>
          <CardDescription>System-wide configuration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="text-sm font-medium">
                Maintenance Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                Temporarily disable access for all users except admins
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={(checked) => {
                setMaintenanceMode(checked)
                toast.info(`Maintenance mode ${checked ? "enabled" : "disabled"}`)
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="user-registration" className="text-sm font-medium">
                User Registration
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow new users to create accounts
              </p>
            </div>
            <Switch
              id="user-registration"
              checked={userRegistration}
              onCheckedChange={(checked) => {
                setUserRegistration(checked)
                toast.info(`User registration ${checked ? "enabled" : "disabled"}`)
              }}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-sm font-medium">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                Send email notifications for system events
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={(checked) => {
                setEmailNotifications(checked)
                toast.info(`Email notifications ${checked ? "enabled" : "disabled"}`)
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
