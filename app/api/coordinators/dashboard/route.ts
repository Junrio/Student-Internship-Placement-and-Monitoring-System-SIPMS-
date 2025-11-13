import { NextRequest, NextResponse } from "next/server"
import { getUsersByRole } from "@/db/queries/users"
import { getAllInternships } from "@/db/queries/internships"
import { evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get all students
    const students = await getUsersByRole("student")
    const totalStudents = students.length

    // Get students added this semester (last 4 months)
    const fourMonthsAgo = new Date()
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)
    const newStudentsThisSemester = students.filter(
      (student) => new Date(student.createdAt) >= fourMonthsAgo
    ).length

    // Get all internships
    const allInternships = await getAllInternships()
    const activeInternships = allInternships.filter(
      (internship) => internship.status === "active"
    )
    const completedInternships = allInternships.filter(
      (internship) => internship.status === "completed"
    )

    // Calculate placement rate
    const placementRate =
      totalStudents > 0
        ? Math.round((activeInternships.length / totalStudents) * 100)
        : 0

    // Get completed internships this semester
    const completedThisSemester = completedInternships.filter(
      (internship) => new Date(internship.updatedAt) >= fourMonthsAgo
    ).length

    // Calculate average rating from all evaluations
    const allEvaluations = await db
      .select()
      .from(evaluations)
      .where(eq(evaluations.status, "reviewed"))

    let averageRating = null
    if (allEvaluations.length > 0) {
      const totalRating = allEvaluations.reduce(
        (sum, evaluation) => sum + evaluation.overallRating,
        0
      )
      averageRating = (totalRating / allEvaluations.length).toFixed(1)
    }

    return NextResponse.json({
      totalStudents,
      newStudentsThisSemester,
      activeInternships: activeInternships.length,
      placementRate,
      completedThisSemester,
      averageRating,
    })
  } catch (error) {
    console.error("Coordinator dashboard data error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching dashboard data" },
      { status: 500 }
    )
  }
}





