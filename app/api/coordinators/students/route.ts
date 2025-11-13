import { NextRequest, NextResponse } from "next/server"
import { getUsersByRole } from "@/db/queries/users"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"

export async function GET(request: NextRequest) {
  try {
    const students = await getUsersByRole("student")

    // Enrich students with internship data
    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const internships = await getInternshipsByStudent(student.id)
        const activeInternship = internships.find((i) => i.status === "active")
        const company = activeInternship ? await getCompanyById(activeInternship.companyId) : null

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone || "Not provided",
          internship: company?.name || null,
          status: activeInternship ? "active" : internships.length > 0 ? "completed" : "pending",
          startDate: activeInternship ? activeInternship.startDate : null,
        }
      })
    )

    // Return with no-cache headers to ensure fresh data
    return NextResponse.json(
      { students: enrichedStudents },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    )
  } catch (error) {
    console.error("Coordinator students error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching students" },
      { status: 500 }
    )
  }
}

