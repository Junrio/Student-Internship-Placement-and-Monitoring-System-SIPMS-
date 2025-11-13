import { NextRequest, NextResponse } from "next/server"
import { users, internships, evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { desc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10", 10)

    // Get recent user registrations
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(5)

    // Get recent internships
    const recentInternships = await db
      .select({
        id: internships.id,
        position: internships.position,
        status: internships.status,
        createdAt: internships.createdAt,
      })
      .from(internships)
      .orderBy(desc(internships.createdAt))
      .limit(5)

    // Get recent evaluations
    const recentEvaluations = await db
      .select({
        id: evaluations.id,
        status: evaluations.status,
        overallRating: evaluations.overallRating,
        createdAt: evaluations.createdAt,
      })
      .from(evaluations)
      .orderBy(desc(evaluations.createdAt))
      .limit(5)

    // Format activity feed
    const activities: Array<{
      id: string
      type: string
      description: string
      timestamp: Date
      metadata?: any
    }> = []

    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: "user_registered",
        description: `${user.name} (${user.role}) registered`,
        timestamp: user.createdAt,
        metadata: { email: user.email, role: user.role },
      })
    })

    recentInternships.forEach((internship) => {
      activities.push({
        id: `internship-${internship.id}`,
        type: "internship_created",
        description: `New internship: ${internship.position} (${internship.status})`,
        timestamp: internship.createdAt,
        metadata: { status: internship.status },
      })
    })

    recentEvaluations.forEach((evaluation) => {
      activities.push({
        id: `evaluation-${evaluation.id}`,
        type: "evaluation_submitted",
        description: `Evaluation submitted (Rating: ${evaluation.overallRating}/5)`,
        timestamp: evaluation.createdAt,
        metadata: { status: evaluation.status, rating: evaluation.overallRating },
      })
    })

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




