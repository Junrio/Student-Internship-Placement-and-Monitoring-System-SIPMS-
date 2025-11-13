import { NextRequest, NextResponse } from "next/server"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getUserById } from "@/db/queries/users"
import { getCompanyById } from "@/db/queries/companies"

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

    // Get active internship for this student
    const studentInternships = await getInternshipsByStudent(studentId)
    const activeInternship = studentInternships.find((i) => i.status === "active") || studentInternships[0]

    if (!activeInternship) {
      return NextResponse.json({ placement: null })
    }

    // Enrich with company and personnel data
    const company = await getCompanyById(activeInternship.companyId)
    // Note: coordinatorId is not in the schema, so we'll skip it for now
    const supervisor = await getUserById(activeInternship.supervisorId)

    return NextResponse.json({
      placement: {
        companyName: company?.name || "Unknown Company",
        position: activeInternship.position,
        department: activeInternship.department || "",
        startDate: activeInternship.startDate,
        endDate: activeInternship.endDate,
        status: activeInternship.status,
        coordinatorName: null, // Coordinator ID not in schema
        supervisorName: supervisor?.name || null,
      },
    })
  } catch (error) {
    console.error("Student placement error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching placement data" },
      { status: 500 }
    )
  }
}

