import { NextRequest, NextResponse } from "next/server"
import { getInternshipsBySupervisor } from "@/db/queries/internships"
import { getEvaluationsByEvaluator } from "@/db/queries/evaluations"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    if (isNaN(supervisorId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get all internships supervised by this supervisor
    const supervisedInternships = await getInternshipsBySupervisor(supervisorId)
    const activeInternships = supervisedInternships.filter(
      (internship) => internship.status === "active"
    )

    // Get unique student IDs from active internships
    const internCount = new Set(activeInternships.map((i) => i.studentId)).size

    // Get all evaluations by this supervisor
    const allEvaluations = await getEvaluationsByEvaluator(supervisorId)

    // Get pending evaluations (draft status)
    const pendingEvaluations = allEvaluations.filter(
      (evaluation) => evaluation.status === "draft"
    )

    // Get evaluations due this week
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    const dueThisWeek = pendingEvaluations.filter((evaluation) => {
      const dueDate = new Date(evaluation.dueDate)
      return dueDate >= today && dueDate <= nextWeek
    })

    // Get completed evaluations
    const completedEvaluations = allEvaluations.filter(
      (evaluation) => evaluation.status === "reviewed"
    )

    // Calculate average performance rating from completed evaluations
    let averagePerformance = null
    if (completedEvaluations.length > 0) {
      const totalRating = completedEvaluations.reduce(
        (sum, evaluation) => sum + evaluation.overallRating,
        0
      )
      averagePerformance = (totalRating / completedEvaluations.length).toFixed(1)
    }

    return NextResponse.json({
      internCount,
      pendingReviews: dueThisWeek.length,
      completedEvaluations: completedEvaluations.length,
      averagePerformance,
    })
  } catch (error) {
    console.error("Supervisor dashboard data error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching dashboard data" },
      { status: 500 }
    )
  }
}

