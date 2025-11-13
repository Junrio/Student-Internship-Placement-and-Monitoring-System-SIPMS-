import { NextRequest, NextResponse } from "next/server"
import { getInternshipsBySupervisor } from "@/db/queries/internships"
import { getEvaluationsByEvaluator } from "@/db/queries/evaluations"
import { getUserById } from "@/db/queries/users"

export async function GET(request: NextRequest) {
  try {
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
    const activeInternships = supervisedInternships.filter((i) => i.status === "active")

    // Get all evaluations by this supervisor
    const allEvaluations = await getEvaluationsByEvaluator(supervisorId)
    const reviewedEvaluations = allEvaluations.filter((e) => e.status === "reviewed")

    // Get weekly evaluation activity (last 8 weeks)
    const weeklyMap = new Map<string, number>()
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    reviewedEvaluations.forEach((evaluation) => {
      const evalDate = new Date(evaluation.createdAt)
      if (evalDate >= eightWeeksAgo) {
        const weekKey = `Week ${Math.floor((Date.now() - evalDate.getTime()) / (7 * 24 * 60 * 60 * 1000))}`
        weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + 1)
      }
    })

    const weeklyActivity = Array.from(weeklyMap.entries())
      .sort((a, b) => {
        const weekA = parseInt(a[0].replace("Week ", ""))
        const weekB = parseInt(b[0].replace("Week ", ""))
        return weekA - weekB
      })
      .map(([week, count]) => ({
        week,
        evaluations: count,
      }))

    // Get top 5 interns by performance
    const internPerformanceMap = new Map<number, { total: number; count: number }>()

    reviewedEvaluations.forEach((evaluation) => {
      const internId = evaluation.studentId
      const current = internPerformanceMap.get(internId) || { total: 0, count: 0 }
      internPerformanceMap.set(internId, {
        total: current.total + evaluation.overallRating,
        count: current.count + 1,
      })
    })

    const topInterns = await Promise.all(
      Array.from(internPerformanceMap.entries())
        .map(([studentId, stats]) => ({
          studentId,
          averageRating: stats.total / stats.count,
          evaluationCount: stats.count,
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5)
        .map(async (intern) => {
          const student = await getUserById(intern.studentId)
          return {
            name: student?.name || "Unknown",
            averageRating: intern.averageRating.toFixed(1),
            evaluationCount: intern.evaluationCount,
          }
        })
    )

    // Get average rating by criteria
    const criteriaMap = new Map<string, { total: number; count: number }>()

    reviewedEvaluations.forEach((evaluation) => {
      evaluation.categories.forEach((category) => {
        const current = criteriaMap.get(category.name) || { total: 0, count: 0 }
        criteriaMap.set(category.name, {
          total: current.total + category.rating,
          count: current.count + 1,
        })
      })
    })

    const averageByCriteria = Array.from(criteriaMap.entries()).map(([name, stats]) => ({
      criteria: name,
      average: (stats.total / stats.count).toFixed(1),
    }))

    // Get score distribution
    const scoreDistribution = [0, 0, 0, 0, 0] // 1-5 ratings
    reviewedEvaluations.forEach((evaluation) => {
      const rating = Math.round(evaluation.overallRating)
      if (rating >= 1 && rating <= 5) {
        scoreDistribution[rating - 1]++
      }
    })

    return NextResponse.json({
      weeklyActivity,
      topInterns,
      averageByCriteria,
      scoreDistribution: scoreDistribution.map((count, index) => ({
        rating: index + 1,
        count,
      })),
    })
  } catch (error) {
    console.error("Supervisor analytics error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching analytics" },
      { status: 500 }
    )
  }
}




