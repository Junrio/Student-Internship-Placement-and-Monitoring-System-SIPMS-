import { NextRequest, NextResponse } from "next/server"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"
import { getUserById } from "@/db/queries/users"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = parseInt(userId, 10)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const internships = await getInternshipsByStudent(studentId)

    // Enrich internships with company and supervisor data
    const enrichedInternships = await Promise.all(
      internships.map(async (internship) => {
        const company = await getCompanyById(internship.companyId)
        const supervisor = await getUserById(internship.supervisorId)

        const startDate = new Date(internship.startDate)
        const endDate = new Date(internship.endDate)
        const totalWeeks = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
        )

        return {
          id: internship.id,
          company: company?.name || "Unknown Company",
          position: internship.position,
          department: internship.department,
          startDate: internship.startDate,
          endDate: internship.endDate,
          supervisor: supervisor?.name || "Unknown Supervisor",
          location: `${company?.city || ""}, ${company?.state || ""}`.trim() || "Not specified",
          status: internship.status,
          duration: `${totalWeeks} weeks`,
        }
      })
    )

    return NextResponse.json({ internships: enrichedInternships })
  } catch (error) {
    console.error("Student internships error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching internships" },
      { status: 500 }
    )
  }
}




