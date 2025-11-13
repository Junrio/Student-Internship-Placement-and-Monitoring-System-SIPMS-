import { NextRequest, NextResponse } from "next/server"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"
import { getInternshipById } from "@/db/queries/internships"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ internId: string }> }
) {
  try {
    const { internId: internIdParam } = await params
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    const internId = parseInt(internIdParam, 10)

    if (isNaN(supervisorId) || isNaN(internId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Get internship to verify supervisor access
    const internship = await getInternshipById(internId)
    if (!internship || internship.supervisorId !== supervisorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get evaluations for this student
    const evaluations = await getEvaluationsByStudent(internship.studentId)

    // Filter evaluations for this internship
    const internshipEvaluations = evaluations
      .filter((e) => e.internshipId === internId && e.status === "reviewed")
      .map((e) => ({
        id: e.id,
        overallRating: e.overallRating,
        feedback: e.feedback,
        createdAt: e.createdAt,
        categories: e.categories,
      }))

    return NextResponse.json({ evaluations: internshipEvaluations })
  } catch (error) {
    console.error("Error fetching intern evaluations:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching evaluations" },
      { status: 500 }
    )
  }
}





