"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, Calendar, Mail, Phone, MapPin, ChevronLeft, Home, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface InternshipData {
  id: number
  company: string
  position: string
  department: string
  studentCount: number
  status: string
  startDate: string
  endDate: string
  supervisor: string
  supervisorEmail: string
  supervisorPhone: string
  companyAddress: string
  description: string
  students: Array<{
    id: number
    name: string
    email: string
    progress: number
    hoursLogged: number
  }>
}

export default function InternshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [internship, setInternship] = useState<InternshipData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInternshipData()
  }, [id])

  const fetchInternshipData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/coordinators/internships/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch internship details")
      }

      const data = await response.json()
      setInternship(data.internship)
    } catch (err) {
      console.error("Error fetching internship:", err)
      setError("Failed to load internship details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !internship) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Internship not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/dashboard/coordinator/internships")}>
          Back to Internships
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/coordinator" className="hover:text-foreground flex items-center gap-1">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard/coordinator/internships" className="hover:text-foreground">
          Internships
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{internship.company}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{internship.company}</h1>
            <p className="text-muted-foreground">{internship.position}</p>
          </div>
        </div>
        <Badge variant={internship.status === "active" ? "default" : "secondary"}>
          {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{internship.companyAddress}</span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{internship.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Students */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Students ({internship.students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {internship.students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students assigned to this internship yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {internship.students.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <Badge variant="outline">{student.progress}% Complete</Badge>
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{student.progress}%</span>
                      </div>
                      <Progress value={student.progress} className="h-2" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Hours Logged:</span>{" "}
                        <span className="font-medium">{student.hoursLogged}h</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Logbook
                      </Button>
                      <Button size="sm" variant="outline">
                        Evaluate
                      </Button>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>OJT Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Start Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(internship.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">End Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(internship.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Supervisor Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Supervisor Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold mb-2">{internship.supervisor}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{internship.supervisorEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{internship.supervisorPhone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



