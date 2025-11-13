"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp } from "lucide-react"

interface Student {
  id: number
  name: string
  email: string
  progress: number
  hoursLogged: number
  evaluationStatus: string
}

interface StudentsListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  internshipId: number
  students?: Student[]
}

export function StudentsListModal({ open, onOpenChange, internshipId, students = [] }: StudentsListModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assigned Students</DialogTitle>
          <DialogDescription>View students assigned to this internship and their progress</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students assigned to this internship yet.
            </div>
          ) : (
            students.map((student) => (
            <div key={student.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                </div>
                <Badge variant={student.evaluationStatus === "reviewed" ? "default" : student.evaluationStatus === "submitted" ? "secondary" : "outline"}>
                  {student.evaluationStatus}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Progress
                  </div>
                  <div className="font-medium">{student.progress}%</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Users className="w-4 h-4" />
                    Hours Logged
                  </div>
                  <div className="font-medium">{student.hoursLogged}h</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Logbook
                  </Button>
                  <Button size="sm" variant="outline">
                    Evaluate
                  </Button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



