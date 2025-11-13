"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, User, Mail, Phone, MapPin, Calendar, Briefcase, Globe, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlacementDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  internshipId: number | null
}

interface PlacementDetails {
  internship: {
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
}

export function PlacementDetailsModal({ open, onOpenChange, internshipId }: PlacementDetailsModalProps) {
  const [details, setDetails] = useState<PlacementDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && internshipId) {
      fetchPlacementDetails()
    } else {
      setDetails(null)
      setError(null)
    }
  }, [open, internshipId])

  const fetchPlacementDetails = async () => {
    if (!internshipId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/coordinators/internships/${internshipId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch placement details")
      }

      const data = await response.json()
      setDetails(data)
    } catch (err) {
      console.error("Error fetching placement details:", err)
      setError("Failed to load placement details. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Active", variant: "default" },
      pending: { label: "Pending", variant: "secondary" },
      completed: { label: "Completed", variant: "outline" },
      terminated: { label: "Terminated", variant: "destructive" },
    }
    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: "outline" as const }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Placement Details</DialogTitle>
          <DialogDescription>View comprehensive information about this internship placement</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : details ? (
          <div className="space-y-6">
            {/* Internship Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Internship Information
                  </CardTitle>
                  {getStatusBadge(details.internship.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{details.internship.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{details.internship.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(details.internship.startDate).toLocaleDateString()} -{" "}
                      {new Date(details.internship.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Students Assigned</p>
                    <p className="font-medium">{details.internship.studentCount}</p>
                  </div>
                </div>
                {details.internship.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{details.internship.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-semibold">{details.internship.company}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {details.internship.companyAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Supervisor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{details.internship.supervisor}</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {details.internship.supervisorEmail}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {details.internship.supervisorPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students List */}
            {details.internship.students && details.internship.students.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Students ({details.internship.students.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {details.internship.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Progress: {student.progress}%</p>
                          <p className="text-muted-foreground">Hours: {student.hoursLogged}h</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}



