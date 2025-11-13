"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Loader2,
  AlertCircle,
  UserCheck,
  ClipboardCheck,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Clock, UserPlus, FileCheck } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  totalUsers: number
  students: number
  coordinators: number
  supervisors: number
  admins: number
  activeInternships: number
  completedThisYear: number
  totalEvaluations: number
  monthlyRegistrations: Array<{ month: string; users: number }>
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: any
}

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [dashboardResponse, activityResponse] = await Promise.all([
        fetch("/api/admins/dashboard"),
        fetch("/api/admins/activity?limit=10"),
      ])

      if (!dashboardResponse.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const dashboardData = await dashboardResponse.json()
      setData(dashboardData)

      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        setActivities(activityData.activities || [])
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Listen for user updates
  useEffect(() => {
    const handleUserUpdate = () => {
      fetchDashboardData()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("userUpdated", handleUserUpdate)
      return () => {
        window.removeEventListener("userUpdated", handleUserUpdate)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and analytics</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System administration and analytics</p>
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and analytics</p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: "#002F6C" }} />
              Total Registered Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.totalUsers || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">All roles combined</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="w-4 h-4" style={{ color: "#002F6C" }} />
              Active Coordinators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.coordinators || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Coordinator role</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: "#002F6C" }} />
              Active Interns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.students || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Student role</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" style={{ color: "#002F6C" }} />
              Evaluations Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.totalEvaluations || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total evaluations</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" style={{ color: "#002F6C" }} />
              Active Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.activeInternships || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#002F6C" }} />
              Completed This Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.completedThisYear || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Internships completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: "#002F6C" }} />
              Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold mt-2" style={{ color: "#001F3F" }}>
              {data?.supervisors || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active supervisors</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      {data && data.monthlyRegistrations && data.monthlyRegistrations.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Monthly User Registrations</CardTitle>
            <CardDescription>User registration trends over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#002F6C"
                  strokeWidth={2}
                  name="New Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and user actions</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="mt-1">
                    {activity.type === "user_registered" && (
                      <UserPlus className="w-4 h-4 text-primary" />
                    )}
                    {activity.type === "internship_created" && (
                      <Briefcase className="w-4 h-4 text-accent" />
                    )}
                    {activity.type === "evaluation_submitted" && (
                      <FileCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/users")}>
            <Users className="w-4 h-4 mr-2" />
            Manage Users
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/analytics")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/system")}>
            <FileText className="w-4 h-4 mr-2" />
            System Settings
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/admin/logs")}>
            <FileText className="w-4 h-4 mr-2" />
            Audit Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
