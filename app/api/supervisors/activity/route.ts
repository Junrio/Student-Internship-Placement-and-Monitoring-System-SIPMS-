import { NextRequest, NextResponse } from "next/server"
import { getEvaluationsByEvaluator } from "@/db/queries/evaluations"
import { getInternshipsBySupervisor } from "@/db/queries/internships"
import { getUserById } from "@/db/queries/users"
import { getCompanyById } from "@/db/queries/companies"

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10)
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    if (isNaN(supervisorId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get recent evaluations
    const allEvaluations = await getEvaluationsByEvaluator(supervisorId)
    const recentEvaluations = allEvaluations
      .filter((e) => e.status === "reviewed")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // Get recent internship assignments
    const supervisedInternships = await getInternshipsBySupervisor(supervisorId)
    const recentInternships = supervisedInternships
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // Format activity feed
    const activities: Array<{
      id: string
      type: string
      description: string
      timestamp: Date
      metadata?: any
    }> = []

    // Add evaluation activities
    for (const evaluation of recentEvaluations) {
      const student = await getUserById(evaluation.studentId)
      activities.push({
        id: `evaluation-${evaluation.id}`,
        type: "evaluation_submitted",
        description: `Evaluation submitted for ${student?.name || "Unknown Student"} (Rating: ${evaluation.overallRating}/5)`,
        timestamp: evaluation.createdAt,
        metadata: { evaluationId: evaluation.id, rating: evaluation.overallRating },
      })
    }

    // Add internship assignment activities
    for (const internship of recentInternships) {
      const student = await getUserById(internship.studentId)
      const company = await getCompanyById(internship.companyId)
      activities.push({
        id: `internship-${internship.id}`,
        type: "intern_assigned",
        description: `${student?.name || "Unknown Student"} assigned to ${company?.name || "Unknown Company"}`,
        timestamp: internship.createdAt,
        metadata: { internshipId: internship.id, position: internship.position },
      })
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({ activities: limitedActivities })
  } catch (error) {
    console.error("Activity feed error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching activity feed" },
      { status: 500 }
    )
  }
}






