import { NextRequest, NextResponse } from "next/server"
import { users, internships, evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { desc, eq, or, like, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const actionFilter = searchParams.get("action") || "all"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = (page - 1) * limit

    // Build audit logs from database events
    const logs: Array<{
      id: string
      timestamp: Date
      action: string
      description: string
      adminId?: number
      adminName?: string
      metadata?: any
    }> = []

    // Get user creation logs
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt))
    allUsers.forEach((user) => {
      logs.push({
        id: `user-${user.id}`,
        timestamp: user.createdAt,
        action: "user_created",
        description: `User account created: ${user.name} (${user.email})`,
        metadata: { userId: user.id, role: user.role },
      })
    })

    // Get internship creation logs
    const allInternships = await db.select().from(internships).orderBy(desc(internships.createdAt))
    allInternships.forEach((internship) => {
      logs.push({
        id: `internship-${internship.id}`,
        timestamp: internship.createdAt,
        action: "internship_created",
        description: `Internship created: ${internship.position}`,
        metadata: { internshipId: internship.id, status: internship.status },
      })
    })

    // Get evaluation submission logs
    const allEvaluations = await db.select().from(evaluations).orderBy(desc(evaluations.createdAt))
    allEvaluations.forEach((evaluation) => {
      if (evaluation.status === "reviewed") {
        logs.push({
          id: `evaluation-${evaluation.id}`,
          timestamp: evaluation.updatedAt,
          action: "evaluation_submitted",
          description: `Evaluation submitted with rating: ${evaluation.overallRating}/5`,
          metadata: { evaluationId: evaluation.id, rating: evaluation.overallRating },
        })
      }
    })

    // Filter by action type
    let filteredLogs = logs
    if (actionFilter !== "all") {
      filteredLogs = logs.filter((log) => log.action === actionFilter)
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Paginate
    const total = filteredLogs.length
    const paginatedLogs = filteredLogs.slice(offset, offset + limit)

    return NextResponse.json({
      logs: paginatedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Audit logs error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching audit logs" },
      { status: 500 }
    )
  }
}






