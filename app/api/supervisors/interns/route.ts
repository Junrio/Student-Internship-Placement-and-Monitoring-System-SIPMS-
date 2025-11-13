import { NextRequest, NextResponse } from "next/server"
import { getInternshipsBySupervisor } from "@/db/queries/internships"
import { getUserById } from "@/db/queries/users"
import { getCompanyById } from "@/db/queries/companies"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"

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

    const supervisedInternships = await getInternshipsBySupervisor(supervisorId)
    const activeInternships = supervisedInternships.filter((i) => i.status === "active")

    // Enrich interns with student and company data
    const enrichedInterns = await Promise.all(
      activeInternships.map(async (internship) => {
        const student = await getUserById(internship.studentId)
        const company = await getCompanyById(internship.companyId)

        // Get latest evaluation rating
        const evaluations = await getEvaluationsByStudent(internship.studentId)
        const latestEvaluation = evaluations
          .filter((e) => e.internshipId === internship.id && e.status === "reviewed")
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

        return {
          id: internship.id,
          name: student?.name || "Unknown Student",
          email: student?.email || "Unknown Email",
          company: company?.name || "Unknown Company",
          position: internship.position,
          startDate: internship.startDate,
          performanceRating: latestEvaluation ? latestEvaluation.overallRating : null,
        }
      })
    )

    return NextResponse.json({ interns: enrichedInterns })
  } catch (error) {
    console.error("Supervisor interns error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching interns" },
      { status: 500 }
    )
  }
}




