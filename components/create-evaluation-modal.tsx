"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface Intern {
  id: number
  name: string
  email: string
  company: string
  position: string
}

interface CreateEvaluationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const evaluationCategories = [
  { name: "Punctuality", weight: 0.15 },
  { name: "Communication", weight: 0.2 },
  { name: "Technical Skills", weight: 0.25 },
  { name: "Teamwork", weight: 0.15 },
  { name: "Initiative", weight: 0.15 },
  { name: "Attendance", weight: 0.1 },
]

export function CreateEvaluationModal({ open, onOpenChange, onSuccess }: CreateEvaluationModalProps) {
  const [interns, setInterns] = useState<Intern[]>([])
  const [selectedInternId, setSelectedInternId] = useState<string>("")
  const [categories, setCategories] = useState(
    evaluationCategories.map((c) => ({ ...c, rating: 3, comments: "" }))
  )
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingInterns, setLoadingInterns] = useState(false)

  useEffect(() => {
    if (open) {
      fetchInterns()
    }
  }, [open])

  const fetchInterns = async () => {
    try {
      setLoadingInterns(true)
      const response = await fetch("/api/supervisors/interns")
      if (!response.ok) throw new Error("Failed to fetch interns")
      const data = await response.json()
      setInterns(data.interns || [])
    } catch (error) {
      console.error("Error fetching interns:", error)
      toast.error("Failed to load interns")
    } finally {
      setLoadingInterns(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedInternId) {
      toast.error("Please select an intern")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/supervisors/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: parseInt(selectedInternId),
          categories: categories.map((c) => ({
            name: c.name,
            rating: c.rating,
            weight: c.weight,
            comments: c.comments,
          })),
          feedback,
          overallRating: calculateOverallRating(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create evaluation")
      }

      toast.success("Evaluation created successfully!")
      onOpenChange(false)
      
      // Reset form
      setSelectedInternId("")
      setCategories(evaluationCategories.map((c) => ({ ...c, rating: 3, comments: "" })))
      setFeedback("")

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Error creating evaluation:", error)
      toast.error(error.message || "Failed to create evaluation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Evaluation</DialogTitle>
          <DialogDescription>Evaluate intern performance across key categories</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="intern">Select Intern *</Label>
            <Select value={selectedInternId} onValueChange={setSelectedInternId} disabled={loadingInterns}>
              <SelectTrigger id="intern">
                <SelectValue placeholder={loadingInterns ? "Loading interns..." : "Select an intern"} />
              </SelectTrigger>
              <SelectContent>
                {interns.map((intern) => (
                  <SelectItem key={intern.id} value={intern.id.toString()}>
                    {intern.name} - {intern.position} at {intern.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {interns.length === 0 && !loadingInterns && (
              <p className="text-sm text-muted-foreground">No active interns available</p>
            )}
          </div>

          <div className="space-y-4">
            <Label>Performance Categories</Label>
            {categories.map((category, index) => (
              <div key={category.name} className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{category.name}</Label>
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

          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Overall Rating:</span> {calculateOverallRating()}/5
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedInternId}>
              {isLoading ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}






