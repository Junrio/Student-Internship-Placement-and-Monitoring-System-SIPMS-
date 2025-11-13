"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, Calendar, ChevronRight, Home, Loader2, AlertCircle, Plus } from "lucide-react"
import { EditInternshipModal } from "@/components/edit-internship-modal"
import { StudentsListModal } from "@/components/students-list-modal"
import { CreateInternshipModal } from "@/components/create-internship-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Internship {
  id: number
  company: string
  position: string
  studentCount: number
  status: string
  startDate: string
  endDate: string
  supervisor: string
}

export default function CoordinatorInternships() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null)
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [internships, setInternships] = useState<Internship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInternships = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/coordinators/internships")
      if (!response.ok) throw new Error("Failed to fetch internships")
      const data = await response.json()
      setInternships(data.internships || [])
    } catch (err) {
      console.error("Error fetching internships:", err)
      setError("Failed to load internships. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInternships()
  }, [])

  const filteredInternships = statusFilter === "all" 
    ? internships 
    : internships.filter((i) => i.status === statusFilter)

  const handleEdit = (internship: Internship) => {
    setSelectedInternship(internship)
    setEditModalOpen(true)
  }

  const handleViewStudents = (internshipId: number) => {
    setSelectedInternshipId(internshipId)
    setStudentsModalOpen(true)
  }

  const handleRefresh = () => {
    fetchInternships()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
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
        <span className="text-foreground">Internships</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Internships</h1>
          <p className="text-muted-foreground">Track and manage active internship placements</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Internship
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : internships.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Internships Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't created any internship programs yet. Start by creating one to manage student placements.
              </p>
              <Button size="lg" onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Internship
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Status Filters */}
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("completed")}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
          </div>

          <div className="space-y-4">
            {filteredInternships.map((internship) => (
          <Card key={internship.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    <CardTitle>{internship.company}</CardTitle>
                    <Badge>{internship.position}</Badge>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(internship.status)}>
                  {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{internship.studentCount} Students Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {internship.startDate} to {internship.endDate}
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Supervisor: <span className="font-medium">{internship.supervisor}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => router.push(`/dashboard/coordinator/internships/${internship.id}`)}>
                  View Details
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(internship)}>
                  Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleViewStudents(internship.id)}>
                  Students
                </Button>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <EditInternshipModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        internship={selectedInternship}
        onSuccess={handleRefresh}
      />
      <StudentsListModal
        open={studentsModalOpen}
        onOpenChange={setStudentsModalOpen}
        internshipId={selectedInternshipId || 0}
      />
      <CreateInternshipModal open={createModalOpen} onOpenChange={setCreateModalOpen} onSuccess={handleRefresh} />
    </div>
  )
}
