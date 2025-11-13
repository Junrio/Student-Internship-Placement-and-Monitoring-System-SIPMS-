"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Loader2, AlertCircle, Plus, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GenerateReportModal } from "@/components/generate-report-modal"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Report {
  id: number
  title: string
  generatedDate: string
  type: string
  internCount: number
}

export default function SupervisorReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const [reportsResponse, analyticsResponse] = await Promise.all([
          fetch("/api/supervisors/reports"),
          fetch("/api/supervisors/analytics"),
        ])

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json()
          setReports(reportsData.reports || [])
        }

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setAnalytics(analyticsData)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load reports. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and view performance reports</p>
          </div>
          <Button>Generate New Report</Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and view performance reports</p>
          </div>
          <Button>Generate New Report</Button>
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
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view performance reports</p>
        </div>
        <Button onClick={() => setReportModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Average Rating by Criteria */}
          {analytics.averageByCriteria && analytics.averageByCriteria.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Average Rating by Criteria</CardTitle>
                <CardDescription>Performance breakdown by evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.averageByCriteria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="criteria" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="average" fill="#002F6C" name="Average Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Score Distribution */}
          {analytics.scoreDistribution && analytics.scoreDistribution.length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Distribution of overall evaluation scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ rating, count }) => `${rating}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.scoreDistribution.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            ["#001F3F", "#002F6C", "#E6F0FF", "#87CEEB", "#B0E0E6"][index % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reports Generated Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't generated any reports yet. Create your first report to analyze intern performance,
                attendance, and evaluation data.
              </p>
              <div className="space-y-4 max-w-lg mx-auto text-left bg-secondary/30 p-6 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">Available report types:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>
                    <strong>Performance Report:</strong> Overview of intern performance ratings and evaluations
                  </li>
                  <li>
                    <strong>Attendance Summary:</strong> Detailed attendance records and statistics
                  </li>
                  <li>
                    <strong>Evaluation Completion:</strong> Status of all evaluations and completion rates
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <Button size="lg" onClick={() => setReportModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Your First Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <Badge variant="outline" className="mt-1">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generated: {report.generatedDate} • {report.internCount} interns included
                  </p>
                </div>
                <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      <GenerateReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSuccess={() => {
          // Refresh reports after generation
          window.location.reload()
        }}
      />
    </div>
  )
}
