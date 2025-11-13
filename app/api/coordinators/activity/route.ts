import { NextRequest, NextResponse } from "next/server"
import { getAllInternships } from "@/db/queries/internships"
import { getUsersByRole } from "@/db/queries/users"
import { getUserById } from "@/db/queries/users"
import { getCompanyById } from "@/db/queries/companies"
import { evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10)

    // Get recent internships
    const allInternships = await getAllInternships()
    const recentInternships = allInternships
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // Get recent evaluations
    const allEvaluations = await db.select().from(evaluations)
    const recentEvaluations = allEvaluations
      .filter((e) => e.status === "reviewed")
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

    // Add internship activities
    for (const internship of recentInternships) {
      const student = await getUserById(internship.studentId)
      const company = await getCompanyById(internship.companyId)
      activities.push({
        id: `internship-${internship.id}`,
        type: "internship_created",
        description: `New internship: ${student?.name || "Unknown"} → ${company?.name || "Unknown Company"} (${internship.position})`,
        timestamp: internship.createdAt,
        metadata: { internshipId: internship.id, status: internship.status },
      })
    }

    // Add evaluation activities
    for (const evaluation of recentEvaluations) {
      const internship = allInternships.find((i) => i.id === evaluation.internshipId)
      if (internship) {
        const student = await getUserById(internship.studentId)
        activities.push({
          id: `evaluation-${evaluation.id}`,
          type: "evaluation_completed",
          description: `Evaluation completed for ${student?.name || "Unknown"} (Rating: ${evaluation.overallRating}/5)`,
          timestamp: evaluation.createdAt,
          metadata: { evaluationId: evaluation.id, rating: evaluation.overallRating },
        })
      }
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






