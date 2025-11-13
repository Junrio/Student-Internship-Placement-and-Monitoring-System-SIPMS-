"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

interface Student {
  id: number
  name: string
  email: string
}

interface Internship {
  id: number
  company: string
  position: string
  companyId: number
}

interface NewPlacementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewPlacementModal({ open, onOpenChange, onSuccess }: NewPlacementModalProps) {
  const [students, setStudents] = useState<Student[]>([])
  const [internships, setInternships] = useState<Internship[]>([])
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [selectedInternshipId, setSelectedInternshipId] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [position, setPosition] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    } else {
      // Reset form when modal closes
      setSelectedStudentIds([])
      setSelectedInternshipId("")
      setCompanyName("")
      setPosition("")
      setStartDate("")
      setEndDate("")
    }
  }, [open])

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const fetchData = async () => {
    try {
      setLoadingData(true)
      const [studentsRes, internshipsRes] = await Promise.all([
        fetch("/api/coordinators/students"),
        fetch("/api/coordinators/internships"),
      ])

      if (!studentsRes.ok || !internshipsRes.ok) {
        throw new Error("Failed to fetch data")
      }

      const studentsData = await studentsRes.json()
      const internshipsData = await internshipsRes.json()

      setStudents(studentsData.students || [])
      setInternships(internshipsData.internships || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoadingData(false)
    }
  }

  const handleInternshipChange = (internshipId: string) => {
    setSelectedInternshipId(internshipId)
    const internship = internships.find((i) => i.id.toString() === internshipId)
    if (internship) {
      setCompanyName(internship.company)
      setPosition(internship.position)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedStudentIds.length === 0 || !selectedInternshipId || !startDate || !endDate) {
      toast.error("Please fill in all required fields and select at least one student")
      return
    }

    setIsLoading(true)
    try {
      // Get the selected internship to get company and supervisor info
      const selectedInternship = internships.find((i) => i.id.toString() === selectedInternshipId)
      if (!selectedInternship) {
        throw new Error("Selected internship not found")
      }

      // Get internship details from API to get companyId and supervisorId
      const internshipRes = await fetch(`/api/internships/${selectedInternshipId}`)
      if (!internshipRes.ok) {
        throw new Error("Failed to fetch internship details")
      }
      const internshipData = await internshipRes.json()

      // Use companyId and supervisorId from the selected internship
      const companyId = internshipData.internship.companyId
      const supervisorId = internshipData.internship.supervisorId

      // Create new internship/placement for all selected students
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: selectedStudentIds.map(id => parseInt(id)), // Send array of student IDs
          companyId: companyId,
          supervisorId: supervisorId,
          position: position || internshipData.internship.position,
          department: internshipData.internship.department || "General",
          startDate,
          endDate,
          status: "pending",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create placement")
      }

      const result = await response.json()
      const count = result.count || selectedStudentIds.length
      toast.success(`Placement${count > 1 ? "s" : ""} created successfully! ${count > 1 ? `${count} students assigned.` : ""}`)
      onOpenChange(false)

      // Reset form
      setSelectedStudentIds([])
      setSelectedInternshipId("")
      setCompanyName("")
      setPosition("")
      setStartDate("")
      setEndDate("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error creating placement:", error)
      toast.error(error.message || "Failed to create placement. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Placement</DialogTitle>
          <DialogDescription>Assign one or more students to an internship program</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Select Students *</Label>
            {loadingData ? (
              <div className="flex items-center justify-center py-8 border rounded-md">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md">
                No students available. Please add students first.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`placement-student-${student.id}`}
                      checked={selectedStudentIds.includes(student.id.toString())}
                      onCheckedChange={() => handleStudentToggle(student.id.toString())}
                    />
                    <Label htmlFor={`placement-student-${student.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {selectedStudentIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="internship">Select Internship *</Label>
            <Select
              value={selectedInternshipId}
              onValueChange={handleInternshipChange}
              disabled={loadingData}
            >
              <SelectTrigger id="internship">
                <SelectValue placeholder={loadingData ? "Loading internships..." : "Select an internship"} />
              </SelectTrigger>
              <SelectContent>
                {internships.map((internship) => (
                  <SelectItem key={internship.id} value={internship.id.toString()}>
                    {internship.company} - {internship.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {internships.length === 0 && !loadingData && (
              <p className="text-sm text-muted-foreground">No internships available. Create an internship first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Position title"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong> The placement will be created with <strong>Pending</strong> status. You can
              confirm or reject it later from the placements page.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || selectedStudentIds.length === 0 || !selectedInternshipId}
            >
              {isLoading ? "Creating..." : `Create Placement${selectedStudentIds.length > 1 ? "s" : ""} (${selectedStudentIds.length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

