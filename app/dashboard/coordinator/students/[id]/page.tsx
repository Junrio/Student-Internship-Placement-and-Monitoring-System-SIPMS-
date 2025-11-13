"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Save, X, Mail, Phone, Calendar, Building2, User, ClipboardList, Copy, Loader2, AlertCircle, MapPin, Globe, Briefcase, Clock, CheckCircle2, XCircle, TrendingUp, Award } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StudentDetails {
  id: number
  userId: string
  name: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

interface CompanyDetails {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  industry: string
  website: string
}

interface SupervisorDetails {
  id: number
  name: string
  email: string
  phone: string
}

interface AttendanceDetails {
  totalRecords: number
  present: number
  absent: number
  leave: number
  percentage: string
  recentRecords: Array<{
    id: number
    date: string
    status: string
    checkInTime: string
    checkOutTime: string
    notes: string
  }>
}

interface InternshipDetails {
  id: number
  internshipId: string
  position: string
  department: string
  startDate: string
  endDate: string
  status: string
  description: string
  responsibilities: string[]
  requirements: string[]
  createdAt: string
  updatedAt: string
  company: CompanyDetails | null
  supervisor: SupervisorDetails | null
  attendance: AttendanceDetails
}

interface Evaluation {
  id: number
  evaluationId: string
  date: string
  dueDate: string
  overallRating: number
  status: string
  feedback: string
  categories: Array<{
    name: string
    rating: number
    weight: number
    comments?: string
  }>
  createdAt: string
  updatedAt: string
}

interface StudentData {
  student: StudentDetails
  internships: InternshipDetails[]
  activeInternship: InternshipDetails | null
  evaluations: Evaluation[]
  totalEvaluations: number
  summary: {
    totalInternships: number
    activeInternships: number
    completedInternships: number
    totalEvaluations: number
    averageRating: string
  }
}

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = params.id as string

  const [data, setData] = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(searchParams.get("edit") === "true")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    startDate: "",
    endDate: "",
    status: "",
  })

  useEffect(() => {
    fetchStudentDetails()
  }, [studentId])

  useEffect(() => {
    setIsEditMode(searchParams.get("edit") === "true")
  }, [searchParams])

  const fetchStudentDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/coordinators/students/${studentId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch student details")
      }

      const result = await response.json()
      setData(result)

      // Initialize form data
      setFormData({
        name: result.student.name,
        email: result.student.email,
        phone: result.student.phone || "",
        position: result.activeInternship?.position || "",
        department: result.activeInternship?.department || "",
        startDate: result.activeInternship?.startDate
          ? new Date(result.activeInternship.startDate).toISOString().split("T")[0]
          : "",
        endDate: result.activeInternship?.endDate
          ? new Date(result.activeInternship.endDate).toISOString().split("T")[0]
          : "",
        status: result.activeInternship?.status || "",
      })
    } catch (err) {
      console.error("Error fetching student details:", err)
      setError("Failed to load student details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/coordinators/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update student")
      }

      toast.success("Student updated successfully")
      setIsEditMode(false)
      fetchStudentDetails()
      
      // Trigger dashboard refresh
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("studentUpdated"))
      }
    } catch (err: any) {
      console.error("Error updating student:", err)
      toast.error(err.message || "Failed to update student")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (data) {
      setFormData({
        name: data.student.name,
        email: data.student.email,
        phone: data.student.phone || "",
        position: data.activeInternship?.position || "",
        department: data.activeInternship?.department || "",
        startDate: data.activeInternship?.startDate
          ? new Date(data.activeInternship.startDate).toISOString().split("T")[0]
          : "",
        endDate: data.activeInternship?.endDate
          ? new Date(data.activeInternship.endDate).toISOString().split("T")[0]
          : "",
        status: data.activeInternship?.status || "",
      })
    }
    setIsEditMode(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      active: { label: "Active", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      completed: { label: "Completed", variant: "outline" },
      confirmed: { label: "Confirmed", variant: "default" },
    }
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Student not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard/coordinator/students")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/coordinator/students")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.student.name}</h1>
            <p className="text-muted-foreground">Student ID: {data.student.userId}</p>
          </div>
          {data.activeInternship && getStatusBadge(data.activeInternship.status)}
        </div>
        {!isEditMode && (
          <Button onClick={() => setIsEditMode(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {isEditMode ? (
        /* Edit Mode */
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Student Information</CardTitle>
              <CardDescription>Update student details and internship information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                {data.activeInternship && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* View Mode - Comprehensive Display */
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Internships</p>
                    <p className="text-2xl font-bold">{data.summary.totalInternships}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{data.summary.activeInternships}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Evaluations</p>
                    <p className="text-2xl font-bold">{data.summary.totalEvaluations}</p>
                  </div>
                  <Award className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold">{data.summary.averageRating}/5</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="text-lg font-medium">{data.student.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Student ID</Label>
                  <p className="font-mono">{data.student.userId}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Email
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(data.student.email)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </Label>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {data.student.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    Phone
                    {data.student.phone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(data.student.phone)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </Label>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {data.student.phone || "Not provided"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Date Joined</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {new Date(data.student.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Active Internship Card */}
            {data.activeInternship ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Active Internship
                    {getStatusBadge(data.activeInternship.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Company</Label>
                    <p className="text-lg font-medium">{data.activeInternship.company?.name || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Position</Label>
                    <p>{data.activeInternship.position}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Department</Label>
                    <p>{data.activeInternship.department}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(data.activeInternship.startDate).toLocaleDateString()} -{" "}
                      {new Date(data.activeInternship.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  {data.activeInternship.supervisor && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Supervisor</Label>
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {data.activeInternship.supervisor.name}
                      </p>
                      <p className="text-sm text-muted-foreground ml-6">{data.activeInternship.supervisor.email}</p>
                    </div>
                  )}
                  {data.activeInternship.attendance.totalRecords > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-muted-foreground">Attendance</Label>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-green-600">Present: {data.activeInternship.attendance.present}</span>
                        <span className="text-red-600">Absent: {data.activeInternship.attendance.absent}</span>
                        <span className="text-blue-600">Leave: {data.activeInternship.attendance.leave}</span>
                        <span className="font-semibold">{data.activeInternship.attendance.percentage}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Active Internship
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">No active internship assigned</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* All Internships */}
          {data.internships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  All Internships ({data.internships.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.internships.map((internship) => (
                    <div key={internship.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{internship.position}</h3>
                            {getStatusBadge(internship.status)}
                          </div>
                          <p className="text-muted-foreground">{internship.company?.name || "N/A"}</p>
                          <p className="text-sm text-muted-foreground">{internship.department}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(internship.startDate).toLocaleDateString()}</p>
                          <p>to {new Date(internship.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {internship.description && (
                        <div>
                          <Label className="text-sm font-medium">Description</Label>
                          <p className="text-sm text-muted-foreground mt-1">{internship.description}</p>
                        </div>
                      )}

                      {internship.company && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <Label className="text-sm font-medium">Company Details</Label>
                            <div className="space-y-1 mt-1 text-sm">
                              <p className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {internship.company.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {internship.company.phone}
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                {internship.company.address}, {internship.company.city}, {internship.company.state}
                              </p>
                              {internship.company.website && (
                                <p className="flex items-center gap-2">
                                  <Globe className="w-3 h-3" />
                                  <a href={internship.company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    {internship.company.website}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                          {internship.supervisor && (
                            <div>
                              <Label className="text-sm font-medium">Supervisor</Label>
                              <div className="space-y-1 mt-1 text-sm">
                                <p className="flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  {internship.supervisor.name}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Mail className="w-3 h-3" />
                                  {internship.supervisor.email}
                                </p>
                                {internship.supervisor.phone && (
                                  <p className="flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    {internship.supervisor.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {internship.responsibilities && internship.responsibilities.length > 0 && (
                        <div className="pt-2 border-t">
                          <Label className="text-sm font-medium">Responsibilities</Label>
                          <ul className="list-disc list-inside text-sm text-muted-foreground mt-1 space-y-1">
                            {internship.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {internship.attendance.totalRecords > 0 && (
                        <div className="pt-2 border-t">
                          <Label className="text-sm font-medium">Attendance Summary</Label>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-green-600">✓ Present: {internship.attendance.present}</span>
                            <span className="text-red-600">✗ Absent: {internship.attendance.absent}</span>
                            <span className="text-blue-600">~ Leave: {internship.attendance.leave}</span>
                            <span className="font-semibold">Total: {internship.attendance.totalRecords} days</span>
                            <span className="font-semibold text-primary">{internship.attendance.percentage}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                All Evaluations ({data.evaluations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.evaluations.length > 0 ? (
                <div className="space-y-4">
                  {data.evaluations.map((evaluation) => (
                    <div key={evaluation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">Evaluation #{evaluation.evaluationId}</h3>
                            {getStatusBadge(evaluation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(evaluation.date).toLocaleDateString()}
                            </span>
                            {evaluation.status === "reviewed" && (
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Rating: {evaluation.overallRating}/5
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {evaluation.categories && evaluation.categories.length > 0 && (
                        <div className="pt-2 border-t">
                          <Label className="text-sm font-medium">Categories</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {evaluation.categories.map((cat, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="font-medium">{cat.name}:</span>{" "}
                                <span className="text-muted-foreground">
                                  {cat.rating}/5 {cat.comments && `- ${cat.comments}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {evaluation.feedback && (
                        <div className="pt-2 border-t">
                          <Label className="text-sm font-medium">Feedback</Label>
                          <p className="text-sm text-muted-foreground mt-1">{evaluation.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No evaluations yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

