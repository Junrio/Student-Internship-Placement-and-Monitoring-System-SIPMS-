"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Loader2, AlertCircle, FileText, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreateEvaluationModal } from "@/components/create-evaluation-modal"
import { GenerateReportModal } from "@/components/generate-report-modal"
import { ViewEvaluationModal } from "@/components/view-evaluation-modal"
import { EditEvaluationModal } from "@/components/edit-evaluation-modal"

interface Evaluation {
  id: number
  studentName: string
  position: string
  dueDate: string
  submittedDate: string | null
  status: string
  rating: number | null
}

export default function SupervisorEvaluations() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null)

  const fetchEvaluations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/supervisors/evaluations")

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

  useEffect(() => {
    fetchEvaluations()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Evaluations</h1>
            <p className="text-muted-foreground">Create and manage intern performance evaluations</p>
          </div>
          <Button>Create Evaluation</Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Evaluations</h1>
            <p className="text-muted-foreground">Create and manage intern performance evaluations</p>
          </div>
          <Button>Create Evaluation</Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const submittedCount = evaluations.filter((e) => e.status === "submitted").length
  const pendingCount = evaluations.filter((e) => e.status === "pending").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Evaluations</h1>
          <p className="text-muted-foreground">Create and manage intern performance evaluations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setReportModalOpen(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Generate New Report
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Evaluation
          </Button>
        </div>
      </div>

      {/* Stats */}
      {evaluations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{evaluations.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{submittedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State or Evaluations List */}
      {evaluations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Evaluations Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't created any evaluations yet. Start by creating an evaluation for one of your interns to
                track their performance and provide feedback.
              </p>
              <div className="space-y-4 max-w-lg mx-auto text-left bg-secondary/30 p-6 rounded-lg">
                <h4 className="font-semibold text-sm mb-3">How to create an evaluation:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Click the "Create Evaluation" button above</li>
                  <li>Select the intern you want to evaluate</li>
                  <li>Fill in the evaluation form with ratings and feedback</li>
                  <li>Submit the evaluation for review</li>
                </ol>
              </div>
              <div className="mt-6">
                <Button size="lg" onClick={() => setCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Evaluation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {evaluations.map((evaluation) => (
          <Card key={evaluation.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{evaluation.studentName}</h3>
                    <Badge variant={evaluation.status === "submitted" ? "default" : "secondary"}>
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
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{evaluation.position}</p>
                    <p>Due: {evaluation.dueDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  {evaluation.rating && (
                    <div>
                      <p className="text-2xl font-bold text-primary">{evaluation.rating}/5</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                {evaluation.status === "submitted" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvaluationId(evaluation.id)
                        setViewModalOpen(true)
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvaluationId(evaluation.id)
                        setEditModalOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedEvaluationId(evaluation.id)
                      setEditModalOpen(true)
                    }}
                  >
                    Create Evaluation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateEvaluationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchEvaluations}
      />
      <GenerateReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        onSuccess={fetchEvaluations}
      />
      <ViewEvaluationModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        evaluationId={selectedEvaluationId}
      />
      <EditEvaluationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        evaluationId={selectedEvaluationId}
        onSuccess={fetchEvaluations}
      />
    </div>
  )
}
