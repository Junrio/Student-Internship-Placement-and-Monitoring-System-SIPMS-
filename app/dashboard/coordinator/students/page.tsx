"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Phone, Loader2, AlertCircle, Users, RefreshCw } from "lucide-react"
import { AddStudentModal } from "@/components/add-student-modal"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Student {
  id: number
  name: string
  email: string
  phone: string
  internship: string | null
  status: string
  startDate: string | null
}

export default function CoordinatorStudents() {
  const [addStudentOpen, setAddStudentOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchStudents = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/coordinators/students?t=${Date.now()}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const data = await response.json()
      setStudents(data.students || [])
    } catch (err) {
      console.error("Error fetching students:", err)
      setError("Failed to load students. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students
    }
    const query = searchQuery.toLowerCase()
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query)
    )
  }, [students, searchQuery])

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    const handleStudentUpdate = () => {
      fetchStudents()
    }

    const handleStudentCreated = () => {
      fetchStudents()
    }

    if (typeof window !== "undefined") {
      window.addEventListener("studentUpdated", handleStudentUpdate)
      window.addEventListener("studentCreated", handleStudentCreated)
      return () => {
        window.removeEventListener("studentUpdated", handleStudentUpdate)
        window.removeEventListener("studentCreated", handleStudentCreated)
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Students</h1>
          <p className="text-muted-foreground">View and manage all enrolled students</p>
        </div>
        <Button onClick={() => setAddStudentOpen(true)}>Add New Student</Button>
      </div>

      <AddStudentModal
        open={addStudentOpen}
        onOpenChange={setAddStudentOpen}
        onSuccess={fetchStudents}
      />

      {/* Search and Refresh */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchStudents} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
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
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No Students Found" : "No Students"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? `No students match your search "${searchQuery}". Try a different search term.`
                  : "There are no students registered in the system yet. Add your first student to get started."}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{student.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {student.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge
                    variant={
                      student.status === "active" ? "default" : student.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {student.status === "active" ? "Active" : student.status === "pending" ? "Pending" : "Completed"}
                  </Badge>
                  {student.internship && <div className="text-sm font-medium">{student.internship}</div>}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Link href={`/dashboard/coordinator/students/${student.id}`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
                <Link href={`/dashboard/coordinator/students/${student.id}?edit=true`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  )
}
