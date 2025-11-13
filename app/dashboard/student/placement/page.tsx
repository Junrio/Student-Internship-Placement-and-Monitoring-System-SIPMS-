"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Briefcase, Calendar, User, Building2, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PlacementData {
  companyName: string
  position: string
  department: string
  startDate: string
  endDate: string
  status: string
  coordinatorName: string | null
  supervisorName: string | null
}

export default function StudentPlacement() {
  const [placement, setPlacement] = useState<PlacementData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlacement() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/students/placement")

        if (!response.ok) {
          throw new Error("Failed to fetch placement data")
        }

        const data = await response.json()
        setPlacement(data.placement || null)
      } catch (err) {
        console.error("Error fetching placement:", err)
        setError("Failed to load placement data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlacement()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Details</h1>
          <p className="text-muted-foreground">View your internship placement information</p>
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
          <h1 className="text-3xl font-bold text-foreground">Placement Details</h1>
          <p className="text-muted-foreground">View your internship placement information</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!placement) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Details</h1>
          <p className="text-muted-foreground">View your internship placement information</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Placement Assigned</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have a placement assigned yet. Once your coordinator assigns you to an internship,
                the details will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="secondary">Pending Confirmation</Badge>
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>
      case "terminated":
        return <Badge variant="destructive">Terminated</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Placement Details</h1>
        <p className="text-muted-foreground">View your internship placement information</p>
      </div>

      {/* Status Alert */}
      {placement.status === "pending" && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your placement is pending confirmation. Once approved by your coordinator, you'll be able to
            access evaluation and progress tracking features.
          </AlertDescription>
        </Alert>
      )}

      {/* Placement Information */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Internship Placement</CardTitle>
            {getStatusBadge(placement.status)}
          </div>
          <CardDescription>Your current internship assignment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="text-lg font-semibold">{placement.companyName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p className="text-lg font-semibold">{placement.position}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p className="text-lg font-semibold">{placement.department || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-lg font-semibold">{formatDate(placement.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-lg font-semibold">{formatDate(placement.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Personnel */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold mb-4">Assigned Personnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Coordinator</p>
                  <p className="text-base font-semibold">
                    {placement.coordinatorName || "Not Assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                  <p className="text-base font-semibold">
                    {placement.supervisorName || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}





