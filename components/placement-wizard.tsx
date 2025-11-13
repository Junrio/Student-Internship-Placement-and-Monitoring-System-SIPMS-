"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface PlacementWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function PlacementWizard({ open, onOpenChange, onSuccess }: PlacementWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    studentIds: [] as string[],
    companyId: "",
    supervisorId: "",
    startDate: "",
    endDate: "",
    position: "",
    department: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [students, setStudents] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [supervisors, setSupervisors] = useState<Array<{ id: string; name: string }>>([])

  // Fetch real data from APIs
  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      setLoadingData(true)
      const [studentsRes, companiesRes, supervisorsRes] = await Promise.all([
        fetch("/api/coordinators/students"),
        fetch("/api/companies"),
        fetch("/api/admins/users?role=supervisor&limit=100"),
      ])

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setStudents(
          (studentsData.students || []).map((s: any) => ({
            id: s.id.toString(),
            name: s.name,
            email: s.email,
          }))
        )
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(
          (companiesData.companies || []).map((c: any) => ({
            id: c.id.toString(),
            name: c.name,
          }))
        )
      }

      if (supervisorsRes.ok) {
        const supervisorsData = await supervisorsRes.json()
        setSupervisors(
          (supervisorsData.users || []).map((s: any) => ({
            id: s.id.toString(),
            name: s.name,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoadingData(false)
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

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create placement")
      }

      toast.success("Placement created successfully!")
      setFormData({
        studentIds: [],
        companyId: "",
        supervisorId: "",
        startDate: "",
        endDate: "",
        position: "",
        department: "",
      })
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to create placement")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step < 4) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Internship Placement</DialogTitle>
          <DialogDescription>Step {step} of 4: Complete the placement wizard</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Select Students */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Select Student(s)</h3>
              {loadingData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students available. Please add students first.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-4">
                  {students.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={formData.studentIds.includes(student.id)}
                      onCheckedChange={() => handleStudentToggle(student.id)}
                    />
                    <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.email}</div>
                    </Label>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Choose Company */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Choose Partner Company</h3>
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })} disabled={loadingData}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Loading companies..." : "Select a company"} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No companies available</div>
                    ) : (
                      companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 3: Assign Supervisor and Duration */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Assign Supervisor and OJT Duration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor *</Label>
                  <Select
                    value={formData.supervisorId}
                    onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}
                    disabled={loadingData}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingData ? "Loading supervisors..." : "Select supervisor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No supervisors available</div>
                      ) : (
                        supervisors.map((supervisor) => (
                        <SelectItem key={supervisor.id} value={supervisor.id}>
                          {supervisor.name}
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Software Developer"
                  />
                </div>
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
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Engineering"
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Confirm Placement Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Students:</span> {formData.studentIds.length} selected
                </div>
                <div>
                  <span className="font-medium">Company:</span> {companies.find((c) => c.id === formData.companyId)?.name}
                </div>
                <div>
                  <span className="font-medium">Supervisor:</span> {supervisors.find((s) => s.id === formData.supervisorId)?.name}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {formData.position}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {formData.startDate} to {formData.endDate}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1 || isLoading}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              {step < 4 ? (
                <Button type="button" onClick={nextStep} disabled={isLoading}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Confirm & Save"}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



