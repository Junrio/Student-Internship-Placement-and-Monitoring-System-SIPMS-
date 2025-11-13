"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Mail, Briefcase, Calendar, TrendingUp, FileText } from "lucide-react"

interface InternProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  internId: number
  internName: string
  internEmail: string
  company: string
  position: string
  startDate: string
}

interface Evaluation {
  id: number
  overallRating: number
  feedback: string
  createdAt: Date
  categories: Array<{ name: string; rating: number }>
}

export function InternProfileModal({
  open,
  onOpenChange,
  internId,
  internName,
  internEmail,
  company,
  position,
  startDate,
}: InternProfileModalProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && internId) {
      fetchEvaluations()
    }
  }, [open, internId])

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/supervisors/interns/${internId}/evaluations`)
      if (response.ok) {
        const data = await response.json()
        setEvaluations(data.evaluations || [])
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error)
      setEvaluations([])
    } finally {
      setIsLoading(false)
    }
  }

  const averageRating =
    evaluations.length > 0
      ? (
          evaluations.reduce((sum, e) => sum + e.overallRating, 0) / evaluations.length
        ).toFixed(1)
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Intern Profile</DialogTitle>
          <DialogDescription>View intern details and evaluation history</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{internName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{internEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {position} at {company}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Started: {new Date(startDate).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {averageRating ? (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-bold" style={{ color: "#002F6C" }}>
                      {averageRating}
                    </p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{evaluations.length}</p>
                    <p className="text-sm text-muted-foreground">Total Evaluations</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No evaluations yet</p>
              )}
            </CardContent>
          </Card>

          {/* Evaluation History */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluation History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : evaluations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No evaluations found for this intern
                </p>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="font-semibold">
                            Rating: {evaluation.overallRating}/5
                          </span>
                        </div>
                        <Badge variant="outline">
                          {new Date(evaluation.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      {evaluation.categories && evaluation.categories.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {evaluation.categories.map((category, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-muted-foreground">{category.name}:</span>
                              <span className="font-medium">{category.rating}/5</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {evaluation.feedback && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

