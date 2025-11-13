import { NextRequest, NextResponse } from "next/server"
import { getEvaluationById, updateEvaluation } from "@/db/queries/evaluations"
import { getUserById } from "@/db/queries/users"
import { getInternshipById } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    const { id } = await params
    const evaluationId = parseInt(id, 10)

    if (isNaN(supervisorId) || isNaN(evaluationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Get evaluation
    const evaluation = await getEvaluationById(evaluationId)
    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 })
    }

    // Verify supervisor owns this evaluation
    if (evaluation.evaluatorId !== supervisorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Enrich with student and internship data
    const student = await getUserById(evaluation.studentId)
    const internship = await getInternshipById(evaluation.internshipId)
    const company = internship ? await getCompanyById(internship.companyId) : null

    return NextResponse.json({
      evaluation: {
        id: evaluation.id,
        evaluationId: evaluation.evaluationId,
        studentId: evaluation.studentId,
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "",
        internshipId: evaluation.internshipId,
        position: internship?.position || "Unknown Position",
        company: company?.name || "Unknown Company",
        dueDate: evaluation.dueDate,
        evaluationDate: evaluation.evaluationDate,
        status: evaluation.status === "reviewed" ? "submitted" : evaluation.status === "draft" ? "pending" : "submitted",
        categories: evaluation.categories || [],
        overallRating: evaluation.overallRating,
        feedback: evaluation.feedback,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching evaluation:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching evaluation" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supervisorId = parseInt(userId, 10)
    const { id } = await params
    const evaluationId = parseInt(id, 10)

    if (isNaN(supervisorId) || isNaN(evaluationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
    }

    // Get evaluation to verify ownership
    const evaluation = await getEvaluationById(evaluationId)
    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 })
    }

    if (evaluation.evaluatorId !== supervisorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { categories, feedback, overallRating, status } = body

    // Prepare update data
    const updateData: any = {}
    if (categories) updateData.categories = categories
    if (feedback !== undefined) updateData.feedback = feedback
    if (overallRating !== undefined) updateData.overallRating = overallRating
    if (status) {
      // Map frontend status to database status
      // "submitted" -> "reviewed" (final submitted state)
      // "pending" -> "draft" (draft/pending state)
      updateData.status = status === "submitted" ? "reviewed" : status === "pending" ? "draft" : status
    }

    // Update evaluation
    const updatedEvaluation = await updateEvaluation(evaluationId, updateData)

    if (!updatedEvaluation) {
      return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      evaluation: updatedEvaluation,
    })
  } catch (error) {
    console.error("Error updating evaluation:", error)
    return NextResponse.json(
      { error: "An error occurred while updating evaluation" },
      { status: 500 }
    )
  }
}

