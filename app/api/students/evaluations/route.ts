import { NextRequest, NextResponse } from "next/server"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"
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

    const evaluations = await getEvaluationsByStudent(studentId)

    // Enrich evaluations with evaluator data
    const enrichedEvaluations = await Promise.all(
      evaluations.map(async (evaluation) => {
        const evaluator = await getUserById(evaluation.evaluatorId)

        return {
          id: evaluation.id,
          evaluator: evaluator?.name || "Unknown Evaluator",
          date: evaluation.evaluationDate,
          overallRating: evaluation.status === "reviewed" ? evaluation.overallRating : null,
          status: evaluation.status,
          categories:
            evaluation.status === "reviewed"
              ? evaluation.categories.map((cat) => ({
                  name: cat.name,
                  rating: cat.rating,
                }))
              : [],
          comments: evaluation.status === "reviewed" ? evaluation.feedback : "",
        }
      })
    )

    return NextResponse.json({ evaluations: enrichedEvaluations })
  } catch (error) {
    console.error("Student evaluations error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching evaluations" },
      { status: 500 }
    )
  }
}





