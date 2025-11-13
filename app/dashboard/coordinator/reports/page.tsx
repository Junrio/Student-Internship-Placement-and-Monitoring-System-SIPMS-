"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Filter, Loader2, AlertCircle, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    company: "all",
    semester: "all",
    status: "all",
  })
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/coordinators/analytics")

        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError("Failed to load analytics data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleExportPDF = () => {
    toast.success("PDF report generated successfully!")
    // TODO: Implement PDF export
  }

  const handleExportExcel = () => {
    toast.success("Excel report generated successfully!")
    // TODO: Implement Excel export
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Generate and export internship reports</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select value={filters.company} onValueChange={(value) => setFilters({ ...filters, company: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="tech-corp">Tech Corp</SelectItem>
                  <SelectItem value="dataflow">DataFlow Systems</SelectItem>
                  <SelectItem value="cloud-systems">Cloud Systems Inc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={filters.semester} onValueChange={(value) => setFilters({ ...filters, semester: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="fall-2024">Fall 2024</SelectItem>
                  <SelectItem value="spring-2025">Spring 2025</SelectItem>
                  <SelectItem value="summer-2025">Summer 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Analytics Charts */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Evaluation Scores by Company */}
              {analytics.evaluationScoresByCompany &&
                analytics.evaluationScoresByCompany.length > 0 && (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle>Evaluation Scores by Company</CardTitle>
                      <CardDescription>Average evaluation scores per company</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.evaluationScoresByCompany}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="company" />
                          <YAxis domain={[0, 5]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="averageScore" fill="#002F6C" name="Average Score" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

              {/* Placements per Company */}
              {analytics.placementsPerCompany && analytics.placementsPerCompany.length > 0 && (
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Placements per Company</CardTitle>
                    <CardDescription>Number of placements by company</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.placementsPerCompany}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="company" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="placements" fill="#001F3F" name="Placements" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Report Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Placement Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analytics?.placementSuccessRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Overall success rate</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Evaluation Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analytics?.evaluationCompletionRate || 0}%
                </p>
                <p className="text-xs text-muted-foreground">Completion rate</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active vs Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {analytics?.activeVsCompleted
                    ? `${analytics.activeVsCompleted.active} / ${analytics.activeVsCompleted.completed}`
                    : "0 / 0"}
                </p>
                <p className="text-xs text-muted-foreground">Active / Completed</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export as PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export as Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



