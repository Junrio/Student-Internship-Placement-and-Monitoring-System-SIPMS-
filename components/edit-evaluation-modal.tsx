"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Star, Loader2 } from "lucide-react"
import { toast } from "sonner"

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

interface EditEvaluationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  evaluationId: number | null
  onSuccess?: () => void
}

export function EditEvaluationModal({ open, onOpenChange, evaluationId, onSuccess }: EditEvaluationModalProps) {
  const [evaluation, setEvaluation] = useState<EvaluationDetails | null>(null)
  const [categories, setCategories] = useState<EvaluationCategory[]>([])
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
        setCategories(data.evaluation.categories || [])
        setFeedback(data.evaluation.feedback || "")
      } catch (err: any) {
        console.error("Error fetching evaluation:", err)
        setError(err.message || "Failed to load evaluation details.")
        toast.error("Failed to load evaluation")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluation()
  }, [evaluationId, open])

  const handleRatingChange = (index: number, rating: number) => {
    const updated = [...categories]
    updated[index].rating = rating
    setCategories(updated)
  }

  const handleCommentChange = (index: number, comment: string) => {
    const updated = [...categories]
    updated[index].comments = comment
    setCategories(updated)
  }

  const calculateOverallRating = () => {
    const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
    if (totalWeight === 0) return 0
    const weightedSum = categories.reduce((sum, c) => sum + c.rating * c.weight, 0)
    return Math.round((weightedSum / totalWeight) * 10) / 10
  }

  const handleSaveDraft = async () => {
    if (!evaluation) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/supervisors/evaluations/${evaluation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: categories.map((c) => ({
            name: c.name,
            rating: c.rating,
            weight: c.weight,
            comments: c.comments || "",
          })),
          feedback,
          overallRating: calculateOverallRating(),
          status: "pending", // Keep as pending
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save draft")
      }

      toast.success("Draft saved successfully!")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Error saving draft:", err)
      toast.error(err.message || "Failed to save draft. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!evaluation) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/supervisors/evaluations/${evaluation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: categories.map((c) => ({
            name: c.name,
            rating: c.rating,
            weight: c.weight,
            comments: c.comments || "",
          })),
          feedback,
          overallRating: calculateOverallRating(),
          status: "submitted", // Mark as submitted
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit evaluation")
      }

      toast.success("Evaluation submitted successfully!")
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error("Error submitting evaluation:", err)
      toast.error(err.message || "Failed to submit evaluation. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Evaluation</DialogTitle>
          <DialogDescription>
            {evaluation && `Editing evaluation for ${evaluation.studentName}`}
          </DialogDescription>
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
            {/* Overall Rating Display */}
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Overall Rating:</span> {calculateOverallRating()}/5
              </p>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <Label>Performance Categories</Label>
              {categories.map((category, index) => (
                <div key={index} className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">{category.name}</Label>
                      <p className="text-xs text-muted-foreground">Weight: {(category.weight * 100).toFixed(0)}%</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingChange(index, star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= category.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder={`Add comments for ${category.name.toLowerCase()}...`}
                    value={category.comments || ""}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    className="w-full p-2 border border-input rounded-md text-sm min-h-12 font-sans"
                  />
                </div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="space-y-2">
              <Label htmlFor="feedback">Overall Feedback *</Label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide overall feedback and recommendations"
                className="w-full p-2 border border-input rounded-md min-h-24 font-sans"
                required
              />
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSaving || isLoading}>
            {isSaving ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



