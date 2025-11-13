"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle, Clock, Loader2, AlertCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Evaluation {
  id: number
  evaluator: string
  date: string
  overallRating: number | null
  status: string
  categories: Array<{
    name: string
    rating: number
  }>
  comments: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )
}

export default function StudentEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvaluations() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/students/evaluations")

        if (!response.ok) {
          throw new Error("Failed to fetch evaluations")
        }

        const data = await response.json()
        setEvaluations(data.evaluations || [])
      } catch (err) {
        console.error("Error fetching evaluations:", err)
        setError("Failed to load evaluations. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvaluations()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Evaluations</h1>
          <p className="text-muted-foreground">Your evaluations from supervisors and coordinators</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Evaluations</h1>
          <p className="text-muted-foreground">Your evaluations from supervisors and coordinators</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance Evaluations</h1>
        <p className="text-muted-foreground">Your evaluations from supervisors and coordinators</p>
      </div>

      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Evaluations</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You don't have any evaluations yet. Once your supervisor or coordinator completes an evaluation,
                it will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
            <Card key={evaluation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>Evaluation from {evaluation.evaluator}</CardTitle>
                      <Badge variant={evaluation.status === "reviewed" ? "default" : "secondary"}>
                        {evaluation.status === "reviewed" ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pending
                          </div>
                        )}
                      </Badge>
                    </div>
                    <CardDescription>{new Date(evaluation.date).toLocaleDateString()}</CardDescription>
                  </div>
                  {evaluation.overallRating && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-2">{evaluation.overallRating}/5</div>
                      <StarRating rating={evaluation.overallRating} />
                    </div>
                  )}
                </div>
              </CardHeader>

              {evaluation.status === "reviewed" && (
                <CardContent className="space-y-4">
                  {/* Category Ratings */}
                  {evaluation.categories.length > 0 && (
                    <div className="space-y-3">
                      <p className="font-medium text-sm">Category Ratings</p>
                      {evaluation.categories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{category.rating}/5</span>
                            <StarRating rating={category.rating} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {evaluation.comments && (
                    <div className="pt-3 border-t border-border">
                      <p className="font-medium text-sm mb-2">Feedback</p>
                      <p className="text-sm text-muted-foreground">{evaluation.comments}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
