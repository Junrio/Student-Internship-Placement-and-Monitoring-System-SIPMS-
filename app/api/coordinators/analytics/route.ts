import { NextRequest, NextResponse } from "next/server"
import { getAllInternships } from "@/db/queries/internships"
import { getUsersByRole } from "@/db/queries/users"
import { evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get all internships
    const allInternships = await getAllInternships()
    const activeInternships = allInternships.filter((i) => i.status === "active")
    const completedInternships = allInternships.filter((i) => i.status === "completed")

    // Get internship growth per semester (last 4 semesters = 2 years)
    const semesterMap = new Map<string, number>()
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    allInternships.forEach((internship) => {
      const createdDate = new Date(internship.createdAt)
      if (createdDate >= twoYearsAgo) {
        const year = createdDate.getFullYear()
        const semester = createdDate.getMonth() < 6 ? "Spring" : "Fall"
        const key = `${semester} ${year}`
        semesterMap.set(key, (semesterMap.get(key) || 0) + 1)
      }
    })

    const internshipGrowth = Array.from(semesterMap.entries())
      .sort((a, b) => {
        const [semA, yearA] = a[0].split(" ")
        const [semB, yearB] = b[0].split(" ")
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
        return semA === "Spring" ? -1 : 1
      })
      .map(([semester, count]) => ({
        semester,
        internships: count,
      }))

    // Calculate placement success rate
    const totalPlacements = allInternships.length
    const confirmedPlacements = activeInternships.length + completedInternships.length
    const placementSuccessRate =
      totalPlacements > 0 ? Math.round((confirmedPlacements / totalPlacements) * 100) : 0

    // Get evaluation completion percentage
    const allEvaluations = await db.select().from(evaluations)
    const reviewedEvaluations = allEvaluations.filter((e) => e.status === "reviewed")
    const evaluationCompletionRate =
      allEvaluations.length > 0
        ? Math.round((reviewedEvaluations.length / allEvaluations.length) * 100)
        : 0

    // Placements per company
    const companyMap = new Map<number, number>()
    allInternships.forEach((internship) => {
      companyMap.set(internship.companyId, (companyMap.get(internship.companyId) || 0) + 1)
    })

    // Get company names
    const { getCompanyById } = await import("@/db/queries/companies")
    const placementsPerCompany = await Promise.all(
      Array.from(companyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(async ([companyId, count]) => {
          const company = await getCompanyById(companyId)
          return {
            company: company?.name || "Unknown Company",
            placements: count,
          }
        })
    )

    // Evaluation scores by company
    const companyEvaluationMap = new Map<number, { total: number; count: number }>()
    reviewedEvaluations.forEach((evaluation) => {
      // Find internship for this evaluation
      const internship = allInternships.find((i) => i.id === evaluation.internshipId)
      if (internship) {
        const current = companyEvaluationMap.get(internship.companyId) || { total: 0, count: 0 }
        companyEvaluationMap.set(internship.companyId, {
          total: current.total + evaluation.overallRating,
          count: current.count + 1,
        })
      }
    })

    const evaluationScoresByCompanyResults = await Promise.all(
      Array.from(companyEvaluationMap.entries()).map(async ([companyId, stats]) => {
        const company = await getCompanyById(companyId)
        return {
          company: company?.name || "Unknown Company",
          averageScore: (stats.total / stats.count).toFixed(1),
          evaluationCount: stats.count,
        }
      })
    )
    const evaluationScoresByCompany = evaluationScoresByCompanyResults.sort(
      (a, b) => parseFloat(b.averageScore) - parseFloat(a.averageScore)
    )

    return NextResponse.json({
      internshipGrowth,
      placementSuccessRate,
      evaluationCompletionRate,
      placementsPerCompany,
      evaluationScoresByCompany,
      activeVsCompleted: {
        active: activeInternships.length,
        completed: completedInternships.length,
      },
    })
  } catch (error) {
    console.error("Coordinator analytics error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching analytics" },
      { status: 500 }
    )
  }
}





