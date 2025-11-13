"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import type { EvaluationFormData, EvaluationCategory } from "@/lib/evaluation-module"

interface EvaluationFormProps {
  onSubmit: (data: EvaluationFormData) => void
  isLoading?: boolean
}

const defaultCategories = [
  { name: "Technical Skills", weight: 0.3 },
  { name: "Communication", weight: 0.2 },
  { name: "Problem Solving", weight: 0.25 },
  { name: "Team Work", weight: 0.15 },
  { name: "Reliability", weight: 0.1 },
]

export function EvaluationForm({ onSubmit, isLoading = false }: EvaluationFormProps) {
  const [categories, setCategories] = useState<EvaluationCategory[]>(
    defaultCategories.map((c) => ({ ...c, rating: 3, comments: "" })),
  )
  const [feedback, setFeedback] = useState("")
  const [internshipId, setInternshipId] = useState("")

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      internshipId,
      categories,
      feedback,
      overallRating: calculateOverallRating(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Evaluation</CardTitle>
        <CardDescription>Evaluate intern performance across key categories</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="internshipId">Internship ID</Label>
            <Input
              id="internshipId"
              value={internshipId}
              onChange={(e) => setInternshipId(e.target.value)}
              placeholder="Select internship"
              required
            />
          </div>

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
                        className={`w-5 h-5 ${star <= category.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Add comments..."
                value={category.comments || ""}
                onChange={(e) => handleCommentChange(index, e.target.value)}
                className="w-full p-2 border border-input rounded-md text-sm min-h-12 font-sans"
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="feedback">Overall Feedback</Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide overall feedback and recommendations"
              className="w-full p-2 border border-input rounded-md min-h-24 font-sans"
            />
          </div>

          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">Overall Rating:</span> {calculateOverallRating()}/5
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
