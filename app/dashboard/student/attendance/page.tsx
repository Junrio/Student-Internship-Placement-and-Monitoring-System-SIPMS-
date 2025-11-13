"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { CheckCircle, XCircle, Calendar, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AttendanceData {
  attendanceSummary: {
    present: number
    absent: number
    leave: number
  }
  weeklyAttendance: Array<{
    week: string
    present: number
    absent: number
    leave: number
  }>
  attendancePercentage: number
}

export default function StudentAttendance() {
  const [data, setData] = useState<AttendanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/students/attendance")

        if (!response.ok) {
          throw new Error("Failed to fetch attendance")
        }

        const attendanceData = await response.json()
        setData(attendanceData)
      } catch (err) {
        console.error("Error fetching attendance:", err)
        setError("Failed to load attendance data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
          <p className="text-muted-foreground">Track your internship attendance and leave</p>
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
          <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
          <p className="text-muted-foreground">Track your internship attendance and leave</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalDays = data
    ? data.attendanceSummary.present + data.attendanceSummary.absent + data.attendanceSummary.leave
    : 0

  const hasNoData = totalDays === 0

  const attendanceSummaryForChart = data
    ? [
        { name: "Present", value: data.attendanceSummary.present, color: "#3b82f6" },
        { name: "Absent", value: data.attendanceSummary.absent, color: "#ef4444" },
        { name: "On Leave", value: data.attendanceSummary.leave, color: "#f59e0b" },
      ]
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
        <p className="text-muted-foreground">Track your internship attendance and leave</p>
      </div>

      {hasNoData ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Attendance Records</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any attendance records yet. Once you start your internship and attendance is marked,
                your records will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.attendancePercentage || 0}%</p>
                <p className="text-xs text-muted-foreground">Above 80% target</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Days Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.attendanceSummary.present || 0}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Days Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.attendanceSummary.absent || 0}</p>
                <p className="text-xs text-muted-foreground">Unauthorized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  On Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data?.attendanceSummary.leave || 0}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Attendance</CardTitle>
                <CardDescription>Presence status by week</CardDescription>
              </CardHeader>
              <CardContent>
                {data && data.weeklyAttendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.weeklyAttendance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="present" fill="#3b82f6" name="Present" />
                      <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                      <Bar dataKey="leave" fill="#f59e0b" name="On Leave" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No weekly attendance data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Distribution</CardTitle>
                <CardDescription>Attendance summary</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceSummaryForChart.some((item) => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={attendanceSummaryForChart}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceSummaryForChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No attendance distribution data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
