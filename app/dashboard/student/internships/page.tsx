"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Calendar, MapPin, User, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Internship {
  id: number
  company: string
  position: string
  department: string
  startDate: string
  endDate: string
  supervisor: string
  location: string
  status: string
  duration: string
}

export default function StudentInternships() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInternships() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/students/internships")

        if (!response.ok) {
          throw new Error("Failed to fetch internships")
        }

        const data = await response.json()
        setInternships(data.internships || [])
      } catch (err) {
        console.error("Error fetching internships:", err)
        setError("Failed to load internships. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInternships()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Internships</h1>
          <p className="text-muted-foreground">View all your current and past internships</p>
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
          <h1 className="text-3xl font-bold text-foreground">My Internships</h1>
          <p className="text-muted-foreground">View all your current and past internships</p>
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
        <h1 className="text-3xl font-bold text-foreground">My Internships</h1>
        <p className="text-muted-foreground">View all your current and past internships</p>
      </div>

      {internships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Internships</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any internships yet. Once you're assigned to an internship, it will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {internships.map((internship) => (
          <Card key={internship.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <CardTitle>{internship.company}</CardTitle>
                    <Badge variant={internship.status === "active" ? "default" : "secondary"}>
                      {internship.status === "active" ? "Active" : "Completed"}
                    </Badge>
                  </div>
                  <CardDescription>{internship.position}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {internship.startDate} to {internship.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Supervisor: {internship.supervisor}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{internship.department}</span> • {internship.duration}
                </div>
              </div>
              {internship.status === "active" && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm">View Details</Button>
                  <Button size="sm" variant="outline">
                    Progress Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  )
}
