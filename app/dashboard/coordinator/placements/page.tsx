"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Loader2, AlertCircle, Plus, XCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { NewPlacementModal } from "@/components/new-placement-modal"
import { PlacementDetailsModal } from "@/components/placement-details-modal"
import { toast } from "sonner"

interface Placement {
  id: number
  studentName: string
  company: string
  position: string
  status: string
  startDate: string
  endDate: string | null
  internshipId: number
}

export default function CoordinatorPlacements() {
  const [placements, setPlacements] = useState<Placement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newPlacementModalOpen, setNewPlacementModalOpen] = useState(false)
  const [viewPlacementModalOpen, setViewPlacementModalOpen] = useState(false)
  const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null)
  const [processingStatus, setProcessingStatus] = useState<Record<number, "confirming" | "rejecting" | null>>({})

  const fetchPlacements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch("/api/coordinators/placements")
      if (!response.ok) throw new Error("Failed to fetch placements")
      const data = await response.json()
      setPlacements(data.placements || [])
    } catch (err) {
      console.error("Error fetching placements:", err)
      setError("Failed to load placements. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlacements()
  }, [])

  const handleView = (internshipId: number) => {
    setSelectedInternshipId(internshipId)
    setViewPlacementModalOpen(true)
  }

  const handleConfirm = async (internshipId: number) => {
    try {
      setProcessingStatus((prev) => ({ ...prev, [internshipId]: "confirming" }))
      
      const response = await fetch("/api/coordinators/placements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId, status: "confirmed" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to confirm placement")
      }

      // Update local state immediately for instant feedback
      setPlacements((prev) =>
        prev.map((p) =>
          p.internshipId === internshipId ? { ...p, status: "confirmed" } : p
        )
      )

      toast.success("Placement confirmed successfully!")
      fetchPlacements()
    } catch (error: any) {
      console.error("Error confirming placement:", error)
      toast.error(error.message || "Failed to confirm placement")
    } finally {
      setProcessingStatus((prev) => ({ ...prev, [internshipId]: null }))
    }
  }

  const handleReject = async (internshipId: number) => {
    try {
      setProcessingStatus((prev) => ({ ...prev, [internshipId]: "rejecting" }))
      
      const response = await fetch("/api/coordinators/placements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internshipId, status: "rejected" }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reject placement")
      }

      // Update local state immediately for instant feedback
      setPlacements((prev) =>
        prev.map((p) =>
          p.internshipId === internshipId ? { ...p, status: "rejected" } : p
        )
      )

      toast.success("Placement rejected")
      fetchPlacements()
    } catch (error: any) {
      console.error("Error rejecting placement:", error)
      toast.error(error.message || "Failed to reject placement")
    } finally {
      setProcessingStatus((prev) => ({ ...prev, [internshipId]: null }))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Placement Management</h1>
            <p className="text-muted-foreground">Track and confirm student internship placements</p>
          </div>
          <Button>New Placement</Button>
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
            <h1 className="text-3xl font-bold text-foreground">Placement Management</h1>
            <p className="text-muted-foreground">Track and confirm student internship placements</p>
          </div>
          <Button>New Placement</Button>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Management</h1>
          <p className="text-muted-foreground">Track and confirm student internship placements</p>
        </div>
        <Button onClick={() => setNewPlacementModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Placement
        </Button>
      </div>

      {placements.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Placements Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You haven't added any student placements yet. Click 'New Placement' to assign students to their
                internship companies.
              </p>
              <Button size="lg" onClick={() => setNewPlacementModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Placement
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {placements.map((placement) => (
          <Card key={placement.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{placement.studentName}</h3>
                    <Badge
                      variant={
                        placement.status === "confirmed"
                          ? "default"
                          : placement.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {placement.status === "confirmed" ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </div>
                      ) : placement.status === "rejected" ? (
                        <div className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </div>
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">{placement.company}</span> - {placement.position}
                    </p>
                    <p>
                      {new Date(placement.startDate).toLocaleDateString()} to{" "}
                      {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : "TBD"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleView(placement.internshipId)}
                >
                  View
                </Button>
                {placement.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleConfirm(placement.internshipId)}
                      disabled={processingStatus[placement.internshipId] === "confirming" || processingStatus[placement.internshipId] === "rejecting"}
                    >
                      {processingStatus[placement.internshipId] === "confirming" ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(placement.internshipId)}
                      disabled={processingStatus[placement.internshipId] === "confirming" || processingStatus[placement.internshipId] === "rejecting"}
                    >
                      {processingStatus[placement.internshipId] === "rejecting" ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </>
                )}
                {placement.status === "confirmed" && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Confirmed</span>
                  </div>
                )}
                {placement.status === "rejected" && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="w-4 h-4" />
                    <span className="font-medium">Rejected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      <NewPlacementModal
        open={newPlacementModalOpen}
        onOpenChange={setNewPlacementModalOpen}
        onSuccess={() => {
          fetchPlacements()
          // Trigger dashboard refresh if callback exists
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("placementUpdated"))
          }
        }}
      />

      <PlacementDetailsModal
        open={viewPlacementModalOpen}
        onOpenChange={setViewPlacementModalOpen}
        internshipId={selectedInternshipId}
      />
    </div>
  )
}
