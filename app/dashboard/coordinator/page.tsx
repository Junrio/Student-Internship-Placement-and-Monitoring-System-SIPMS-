"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Briefcase,
  Award,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  UserPlus,
} from "lucide-react"
import { AddStudentModal } from "@/components/add-student-modal"
import { PlacementWizard } from "@/components/placement-wizard"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface DashboardData {
  totalStudents: number
  newStudentsThisSemester: number
  activeInternships: number
  placementRate: number
  completedThisSemester: number
  averageRating: string | null
}

interface AnalyticsData {
  internshipGrowth: Array<{ semester: string; internships: number }>
  placementSuccessRate: number
  evaluationCompletionRate: number
  placementsPerCompany: Array<{ company: string; placements: number }>
  evaluationScoresByCompany: Array<{ company: string; averageScore: string; evaluationCount: number }>
  activeVsCompleted: { active: number; completed: number }
}

interface Activity {
  id: string
  type: string
  description: string
  timestamp: Date
  metadata?: any
}

export default function CoordinatorDashboard() {
  const router = useRouter()
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [placementWizardOpen, setPlacementWizardOpen] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [dashboardResponse, analyticsResponse, activityResponse] = await Promise.all([
        fetch("/api/coordinators/dashboard"),
        fetch("/api/coordinators/analytics"),
        fetch("/api/coordinators/activity?limit=10"),
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    const handlePlacementUpdate = () => {
      fetchDashboardData()
    }

    const handleStudentUpdate = () => {
      fetchDashboardData()
    }

    const handleStudentCreated = () => {
      fetchDashboardData()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("placementUpdated", handlePlacementUpdate)
      window.addEventListener("studentUpdated", handleStudentUpdate)
      window.addEventListener("studentCreated", handleStudentCreated)
      return () => {
        window.removeEventListener("placementUpdated", handlePlacementUpdate)
        window.removeEventListener("studentUpdated", handleStudentUpdate)
        window.removeEventListener("studentCreated", handleStudentCreated)
      }
    }
  }, [])

  const handleRefresh = () => {
    fetchDashboardData()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage students, internships, and placements</p>
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
          <h1 className="text-3xl font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage students, internships, and placements</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Manage students, internships, and placements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.totalStudents || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {data?.newStudentsThisSemester
                      ? `+${data.newStudentsThisSemester} this semester`
                      : "No new students"}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of registered students in the system</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-accent" />
                    Active Internships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.activeInternships || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {data?.placementRate ? `${data.placementRate}% placement rate` : "No placements"}
                  </p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Currently active internship placements</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{data?.completedThisSemester || 0}</p>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Internships completed this semester</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    Avg Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {data?.averageRating ? `${data.averageRating}/5` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground">Student performance</p>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Average student evaluation from current semester</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Charts */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Internship Growth */}
            {analytics.internshipGrowth && analytics.internshipGrowth.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Internship Growth per Semester</CardTitle>
                  <CardDescription>New internships created over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.internshipGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="internships" fill="#002F6C" name="Internships" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Placement Success Rate & Evaluation Completion */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
                <CardDescription>Placement and evaluation completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Placement Success Rate</span>
                      <span className="text-sm font-bold">{analytics.placementSuccessRate}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${analytics.placementSuccessRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Evaluation Completion</span>
                      <span className="text-sm font-bold">{analytics.evaluationCompletionRate}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${analytics.evaluationCompletionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placements per Company */}
        {analytics && analytics.placementsPerCompany && analytics.placementsPerCompany.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Placements per Company</CardTitle>
              <CardDescription>Top companies by number of placements</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.placementsPerCompany}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="company" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="placements" fill="#001F3F" name="Placements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Active vs Completed */}
        {analytics && analytics.activeVsCompleted && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Internship Status Distribution</CardTitle>
              <CardDescription>Active vs completed internships</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Active", value: analytics.activeVsCompleted.active },
                      { name: "Completed", value: analytics.activeVsCompleted.completed },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#002F6C" />
                    <Cell fill="#E6F0FF" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Feed */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest placements and evaluations</CardDescription>
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
                      {activity.type === "internship_created" && (
                        <Briefcase className="w-4 h-4 text-primary" />
                      )}
                      {activity.type === "evaluation_completed" && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
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
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setAddStudentOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Student
            </Button>
            <Button variant="outline" onClick={() => setPlacementWizardOpen(true)}>
              <Briefcase className="w-4 h-4 mr-2" />
              Create Placement
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/coordinator/internships")}>
              <FileText className="w-4 h-4 mr-2" />
              Manage Internships
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/coordinator/reports")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddStudentModal open={addStudentOpen} onOpenChange={setAddStudentOpen} onSuccess={handleRefresh} />
        <PlacementWizard open={placementWizardOpen} onOpenChange={setPlacementWizardOpen} onSuccess={handleRefresh} />
      </div>
    </TooltipProvider>
  )
}
