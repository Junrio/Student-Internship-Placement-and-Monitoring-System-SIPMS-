"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Mail, Briefcase, Loader2, AlertCircle, Users, Filter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InternProfileModal } from "@/components/intern-profile-modal"
import { useRouter } from "next/navigation"

interface Intern {
  id: number
  name: string
  email: string
  company: string
  position: string
  startDate: string
  performanceRating: number | null
}

export default function SupervisorInterns() {
  const router = useRouter()
  const [interns, setInterns] = useState<Intern[]>([])
  const [filteredInterns, setFilteredInterns] = useState<Intern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  useEffect(() => {
    async function fetchInterns() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch("/api/supervisors/interns")

        if (!response.ok) {
          throw new Error("Failed to fetch interns")
        }

        const data = await response.json()
        setInterns(data.interns || [])
        setFilteredInterns(data.interns || [])
      } catch (err) {
        console.error("Error fetching interns:", err)
        setError("Failed to load interns. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterns()
  }, [])

  useEffect(() => {
    let filtered = [...interns]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (intern) =>
          intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          intern.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          intern.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          intern.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter === "rated") {
      filtered = filtered.filter((intern) => intern.performanceRating !== null)
    } else if (statusFilter === "not_rated") {
      filtered = filtered.filter((intern) => intern.performanceRating === null)
    }

    setFilteredInterns(filtered)
  }, [searchQuery, statusFilter, interns])

  const handleViewProfile = (intern: Intern) => {
    setSelectedIntern(intern)
    setProfileModalOpen(true)
  }

  const handleEvaluate = (internId: number) => {
    router.push(`/dashboard/supervisor/evaluations?internId=${internId}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Interns</h1>
        <p className="text-muted-foreground">Manage and evaluate interns under your supervision</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, company, or position..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Interns</SelectItem>
            <SelectItem value="rated">Rated</SelectItem>
            <SelectItem value="not_rated">Not Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredInterns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {interns.length === 0 ? "No Interns" : "No Matching Interns"}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {interns.length === 0
                  ? "You don't have any interns assigned to you yet. Once students are assigned to internships under your supervision, they will appear here."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInterns.map((intern) => (
          <Card key={intern.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{intern.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {intern.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {intern.position} at {intern.company}
                    </div>
                    <div>Started: {intern.startDate}</div>
                  </div>
                </div>
                <div className="text-right">
                  {intern.performanceRating ? (
                    <div>
                      <p className="text-2xl font-bold text-primary">{intern.performanceRating}</p>
                      <p className="text-xs text-muted-foreground">Performance Rating</p>
                    </div>
                  ) : (
                    <Badge variant="secondary">Not Rated</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(intern)}
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEvaluate(intern.id)}
                >
                  Evaluate
                </Button>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Intern Profile Modal */}
      {selectedIntern && (
        <InternProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          internId={selectedIntern.id}
          internName={selectedIntern.name}
          internEmail={selectedIntern.email}
          company={selectedIntern.company}
          position={selectedIntern.position}
          startDate={selectedIntern.startDate}
        />
      )}
    </div>
  )
}
