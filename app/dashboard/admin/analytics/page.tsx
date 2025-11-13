"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Users, Briefcase, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AnalyticsData {
  totalUsers: number
  activeInternships: number
  averageScore: string | null
  placementRate: number
  monthlyRegistrations: Array<{ month: string; users: number }>
  monthlyEvaluations: Array<{ month: string; evaluations: number }>
  departmentDistribution: Array<{ department: string; count: number }>
  roleDistribution: Array<{ name: string; value: number; color: string }>
  totalEvaluations: number
  completedInternships: number
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/admins/analytics")

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data")
        }

        const analyticsData = await response.json()
        setData(analyticsData)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">System-wide statistics and trends</p>
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
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">System-wide statistics and trends</p>
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">System-wide statistics and trends</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: "#002F6C" }} />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#001F3F" }}>
              {data?.totalUsers || 0}
            </p>
            <p className="text-xs text-muted-foreground">All roles</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" style={{ color: "#002F6C" }} />
              Active Internships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#001F3F" }}>
              {data?.activeInternships || 0}
            </p>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" style={{ color: "#002F6C" }} />
              Avg Evaluation Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#001F3F" }}>
              {data?.averageScore ? `${data.averageScore}/5` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: "#002F6C" }} />
              Placement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" style={{ color: "#001F3F" }}>
              {data?.placementRate || 0}%
            </p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly User Registrations */}
        {data && data.monthlyRegistrations && data.monthlyRegistrations.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Monthly User Registrations</CardTitle>
              <CardDescription>User growth trends over the last 12 months</CardDescription>
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

        {/* Role Distribution */}
        {data && data.roleDistribution && data.roleDistribution.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Users by role</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.roleDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evaluation Trends */}
      {data && data.monthlyEvaluations && data.monthlyEvaluations.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Evaluation Submission Trends</CardTitle>
            <CardDescription>Evaluations submitted per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyEvaluations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="evaluations"
                  stroke="#002F6C"
                  fill="#E6F0FF"
                  name="Evaluations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Department Distribution */}
      {data && data.departmentDistribution && data.departmentDistribution.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Internship Distribution by Department</CardTitle>
            <CardDescription>Number of internships per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#002F6C" name="Internships" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
