"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Internship {
  id: number
  company: string
  position: string
  status: string
  startDate: string
  endDate: string
  supervisor: string
}

interface Student {
  id: number
  name: string
  email: string
}

interface EditInternshipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  internship: Internship | null
  onSuccess?: () => void
}

export function EditInternshipModal({ open, onOpenChange, internship, onSuccess }: EditInternshipModalProps) {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    supervisor: "",
    startDate: "",
    endDate: "",
    status: "",
    studentIds: [] as string[],
  })
  const [students, setStudents] = useState<Student[]>([])
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    if (open && internship) {
      fetchInternshipDetails()
      fetchAllStudents()
    } else {
      // Reset form when modal closes
      setFormData({
        company: "",
        position: "",
        supervisor: "",
        startDate: "",
        endDate: "",
        status: "",
        studentIds: [],
      })
      setAssignedStudentIds([])
    }
  }, [open, internship])

  const fetchInternshipDetails = async () => {
    if (!internship) return

    try {
      setLoadingStudents(true)
      const response = await fetch(`/api/coordinators/internships/${internship.id}`)
      if (response.ok) {
        const data = await response.json()
        const internshipData = data.internship
        
        // Format dates for input fields
        const startDate = internshipData.startDate 
          ? new Date(internshipData.startDate).toISOString().split("T")[0]
          : ""
        const endDate = internshipData.endDate 
          ? new Date(internshipData.endDate).toISOString().split("T")[0]
          : ""

        setFormData({
          company: internshipData.company || "",
          position: internshipData.position || "",
          supervisor: internshipData.supervisor || "",
          startDate: startDate,
          endDate: endDate,
          status: internshipData.status || "active",
          studentIds: [],
        })

        // Get currently assigned student IDs
        if (internshipData.students && Array.isArray(internshipData.students)) {
          const currentStudentIds = internshipData.students.map((s: any) => s.id.toString())
          setAssignedStudentIds(currentStudentIds)
          setFormData(prev => ({ ...prev, studentIds: currentStudentIds }))
        }
      }
    } catch (error) {
      console.error("Error fetching internship details:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const response = await fetch("/api/coordinators/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const handleStudentToggle = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!internship) return

    if (formData.studentIds.length === 0) {
      toast.error("Please select at least one student")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/internships/${internship.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          studentIds: formData.studentIds, // Send array of student IDs
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update internship")
      }

      const result = await response.json()
      const count = result.count || 1
      toast.success(`Internship updated successfully! ${count > 1 ? `${count} student assignments updated.` : ""}`)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to update internship")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Internship</DialogTitle>
          <DialogDescription>Update internship details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor *</Label>
            <Input
              id="supervisor"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Students *</Label>
            {loadingStudents ? (
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
                      id={`edit-student-${student.id}`}
                      checked={formData.studentIds.includes(student.id.toString())}
                      onCheckedChange={() => handleStudentToggle(student.id.toString())}
                    />
                    <Label htmlFor={`edit-student-${student.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {formData.studentIds.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {formData.studentIds.length} student{formData.studentIds.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || formData.studentIds.length === 0}
            >
              {isLoading ? "Updating..." : `Save Changes (${formData.studentIds.length} student${formData.studentIds.length > 1 ? "s" : ""})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}





