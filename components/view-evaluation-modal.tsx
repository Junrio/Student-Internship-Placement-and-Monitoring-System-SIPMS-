"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Star, CheckCircle, Clock, Loader2, User, Mail, Briefcase, Building2, Calendar, FileText } from "lucide-react"

interface EvaluationCategory {
  name: string
  rating: number
  weight: number
  comments?: string
}

interface EvaluationDetails {
  id: number
  evaluationId: string
  studentName: string
  studentEmail: string
  position: string
  company: string
  dueDate: string
  evaluationDate: string
  status: "submitted" | "pending"
  categories: EvaluationCategory[]
  overallRating: number
  feedback: string
  createdAt: string
  updatedAt: string
}

interface ViewEvaluationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluationId: number | null
}

export function ViewEvaluationModal({ open, onOpenChange, evaluationId }: ViewEvaluationModalProps) {
  const [evaluation, setEvaluation] = useState<EvaluationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvaluation() {
      if (!evaluationId || !open) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/supervisors/evaluations/${evaluationId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch evaluation details")
        }

        const data = await response.json()
        setEvaluation(data.evaluation)
      } catch (err: any) {
        console.error("Error fetching evaluation:", err)
        setError(err.message || "Failed to load evaluation details.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluation()
  }, [evaluationId, open])

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evaluation Details</DialogTitle>
          <DialogDescription>View complete evaluation information</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge variant={evaluation.status === "submitted" ? "default" : "secondary"} className="text-sm">
                {evaluation.status === "submitted" ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Submitted
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pending
                  </div>
                )}
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{evaluation.overallRating}/5</p>
                <p className="text-xs text-muted-foreground">Overall Rating</p>
              </div>
            </div>

            {/* Intern Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Intern Name:</span>
                  <span>{evaluation.studentName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{evaluation.studentEmail}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Company:</span>
                  <span>{evaluation.company}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Position:</span>
                  <span>{evaluation.position}</span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Due Date:</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(evaluation.dueDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {evaluation.status === "submitted" ? "Submitted Date:" : "Last Updated:"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(evaluation.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Performance Categories</h3>
              {evaluation.categories.map((category, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{category.name}</Label>
                      <p className="text-xs text-muted-foreground">Weight: {(category.weight * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= category.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 font-medium">{category.rating}/5</span>
                    </div>
                  </div>
                  {category.comments && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">{category.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Overall Feedback</h3>
              </div>
              <div className="p-4 bg-secondary/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{evaluation.feedback || "No feedback provided."}</p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Evaluations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

