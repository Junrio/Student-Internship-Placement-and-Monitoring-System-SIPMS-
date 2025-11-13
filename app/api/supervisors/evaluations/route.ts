import { NextRequest, NextResponse } from "next/server"
import { getEvaluationsByEvaluator } from "@/db/queries/evaluations"
import { getUserById } from "@/db/queries/users"
import { getInternshipById } from "@/db/queries/internships"
import { createEvaluation } from "@/db/queries/evaluations"

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

    const evaluations = await getEvaluationsByEvaluator(supervisorId)

    // Enrich evaluations with student and internship data
    const enrichedEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const student = await getUserById(evaluation.studentId)
        const internship = await getInternshipById(evaluation.internshipId)

        return {
          id: evaluation.id,
          studentName: student?.name || "Unknown Student",
          position: internship?.position || "Unknown Position",
          dueDate: evaluation.dueDate,
          submittedDate: evaluation.status === "reviewed" ? evaluation.updatedAt : null,
          status: evaluation.status === "reviewed" ? "submitted" : "pending",
          rating: evaluation.status === "reviewed" ? evaluation.overallRating : null,
        }
      })
    )

    return NextResponse.json({ evaluations: enrichedEvaluations })
  } catch (error) {
    console.error("Supervisor evaluations error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching evaluations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    if (isNaN(supervisorId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { internshipId, categories, feedback, overallRating } = body

    if (!internshipId || !categories || !feedback) {
      return NextResponse.json(
        { error: "Missing required fields: internshipId, categories, and feedback are required" },
        { status: 400 }
      )
    }

    // Get internship to get student ID
    const internship = await getInternshipById(internshipId)
    if (!internship) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 })
    }

    // Verify supervisor owns this internship
    if (internship.supervisorId !== supervisorId) {
      return NextResponse.json({ error: "Unauthorized: You can only evaluate your own interns" }, { status: 403 })
    }

    // Generate evaluation ID
    const evaluationId = `EVAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calculate due date (30 days from now)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create evaluation
    const newEvaluation = await createEvaluation({
      evaluationId,
      internshipId,
      evaluatorId: supervisorId,
      studentId: internship.studentId,
      evaluationDate: new Date(),
      dueDate,
      status: "reviewed",
      categories: categories.map((cat: any) => ({
        name: cat.name,
        rating: cat.rating,
        weight: cat.weight,
        comments: cat.comments || "",
      })),
      overallRating: Math.round(overallRating),
      feedback,
    })

    return NextResponse.json({
      success: true,
      evaluation: newEvaluation,
    })
  } catch (error) {
    console.error("Create evaluation error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating evaluation" },
      { status: 500 }
    )
  }
}
