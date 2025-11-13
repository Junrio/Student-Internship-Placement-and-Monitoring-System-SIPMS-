"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserPlus,
  Briefcase,
  FileCheck,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
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
} from "recharts"

interface DashboardData {
  internCount: number
  pendingReviews: number
  completedEvaluations: number
  averagePerformance: string | null
}

interface AnalyticsData {
  weeklyActivity: Array<{ week: string; evaluations: number }>
  topInterns: Array<{ name: string; averageRating: string; evaluationCount: number }>
  averageByCriteria: Array<{ criteria: string; average: string }>
  scoreDistribution: Array<{ rating: number; count: number }>
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: any
}

export default function SupervisorDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        setError(null)
        const [dashboardResponse, analyticsResponse, activityResponse] = await Promise.all([
          fetch("/api/supervisors/dashboard"),
          fetch("/api/supervisors/analytics"),
          fetch("/api/supervisors/activity?limit=10"),
        ])

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch dashboard data")
        }

        const dashboardData = await dashboardResponse.json()
        setData(dashboardData)

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }

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

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Evaluate and monitor intern performance</p>
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
          <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Evaluate and monitor intern performance</p>
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
        <h1 className="text-3xl font-bold text-foreground">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">Evaluate and monitor intern performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Interns Supervised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.internCount || 0}</p>
            <p className="text-xs text-muted-foreground">Current batch</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.pendingReviews || 0}</p>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.completedEvaluations || 0}</p>
            <p className="text-xs text-muted-foreground">Evaluations done</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {data?.averagePerformance ? `${data.averagePerformance}/5` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">Overall rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Evaluation Activity */}
        {analytics && analytics.weeklyActivity && analytics.weeklyActivity.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Weekly Evaluation Activity</CardTitle>
              <CardDescription>Evaluations submitted over the last 8 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="evaluations" fill="#002F6C" name="Evaluations" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top 5 Interns by Performance */}
        {analytics && analytics.topInterns && analytics.topInterns.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Top 5 Interns by Performance</CardTitle>
              <CardDescription>Highest rated interns under your supervision</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.topInterns}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageRating" fill="#001F3F" name="Average Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Score Distribution */}
      {analytics && analytics.scoreDistribution && analytics.scoreDistribution.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Distribution of overall evaluation scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#E6F0FF" name="Number of Evaluations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Feed */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest evaluations and intern assignments</CardDescription>
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
                    {activity.type === "evaluation_submitted" && (
                      <FileCheck className="w-4 h-4 text-green-600" />
                    )}
                    {activity.type === "intern_assigned" && (
                      <UserPlus className="w-4 h-4 text-primary" />
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
          <CardDescription>Manage evaluations and reviews</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/supervisor/evaluations")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create Evaluation
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/supervisor/interns")}>
            <Users className="w-4 h-4 mr-2" />
            View Interns
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/supervisor/reports")}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
