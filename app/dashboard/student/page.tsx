"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { BookOpen, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface DashboardData {
  hasActiveInternship: boolean
  activeInternship: {
    companyName: string
    position: string
    department: string
  } | null
  duration: {
    totalWeeks: number
    weeksCompleted: number
  } | null
  attendance: {
    percentage: number
    present: number
    total: number
  } | null
  rating: string | null
  attendanceChart: Array<{
    week: string
    present: number
    absent: number
  }>
  upcomingEvaluation: {
    dueDate: string
    evaluationDate: string
  } | null
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/students/dashboard")
        
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your internship progress and performance</p>
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
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your internship progress and performance</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Handle empty state - no active internship
  if (!data?.hasActiveInternship) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your internship progress and performance</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Internship</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have an active internship at the moment. Once you're assigned to an internship,
                your progress and performance data will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your internship progress and performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Active Internship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.activeInternship?.companyName || "N/A"}</p>
            <p className="text-xs text-muted-foreground">
              {data.activeInternship?.position || "No position"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.duration ? `${data.duration.totalWeeks} Weeks` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.duration
                ? `${data.duration.weeksCompleted} weeks completed`
                : "No data available"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.attendance ? `${data.attendance.percentage}%` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.attendance
                ? `${data.attendance.present}/${data.attendance.total} days`
                : "No attendance records"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data.rating ? `${data.rating}/5` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.rating ? "Based on evaluations" : "No evaluations yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {data.upcomingEvaluation && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your mid-internship evaluation is scheduled for {formatDate(data.upcomingEvaluation.dueDate)}.
            Please prepare your progress report.
          </AlertDescription>
        </Alert>
      )}

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Your attendance for the past 4 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          {data.attendanceChart && data.attendanceChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.attendanceChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#3b82f6" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No attendance data available for the past 4 weeks
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
