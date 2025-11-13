import { NextRequest, NextResponse } from "next/server"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getAttendanceByInternship } from "@/db/queries/attendance"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"
import { getCompanyById } from "@/db/queries/companies"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const studentId = parseInt(userId, 10)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Get all internships for the student
    const allInternships = await getInternshipsByStudent(studentId)

    // Find active internship
    const activeInternship = allInternships.find(
      (internship) => internship.status === "active"
    )

    // If no active internship, return empty data
    if (!activeInternship) {
      return NextResponse.json({
        hasActiveInternship: false,
        activeInternship: null,
        duration: null,
        attendance: null,
        rating: null,
        attendanceChart: [],
        upcomingEvaluation: null,
      })
    }

    // Get company information
    const company = await getCompanyById(activeInternship.companyId)

    // Calculate duration
    const startDate = new Date(activeInternship.startDate)
    const endDate = new Date(activeInternship.endDate)
    const today = new Date()
    const totalWeeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    )
    const weeksCompleted = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    )

    // Get attendance records
    const attendanceRecords = await getAttendanceByInternship(activeInternship.id)

    // Calculate attendance stats
    const presentCount = attendanceRecords.filter(
      (record) => record.status === "present"
    ).length
    const absentCount = attendanceRecords.filter(
      (record) => record.status === "absent"
    ).length
    const totalDays = presentCount + absentCount
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0

    // Calculate attendance by week for the past 4 weeks
    const attendanceChart = []
    const now = new Date()
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i + 1) * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekRecords = attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= weekStart && recordDate <= weekEnd
      })

      const weekPresent = weekRecords.filter(
        (record) => record.status === "present"
      ).length
      const weekAbsent = weekRecords.filter(
        (record) => record.status === "absent"
      ).length

      attendanceChart.push({
        week: `Week ${4 - i}`,
        present: weekPresent,
        absent: weekAbsent,
      })
    }

    // Get evaluations and calculate average rating
    const evaluations = await getEvaluationsByStudent(studentId)
    const activeInternshipEvaluations = evaluations.filter(
      (evaluation) => evaluation.internshipId === activeInternship.id && evaluation.status === "reviewed"
    )

    let averageRating = null
    if (activeInternshipEvaluations.length > 0) {
      const totalRating = activeInternshipEvaluations.reduce(
        (sum, evaluation) => sum + evaluation.overallRating,
        0
      )
      averageRating = (totalRating / activeInternshipEvaluations.length).toFixed(1)
    }

    // Get upcoming evaluation
    const upcomingEvaluation = evaluations
      .filter(
        (evaluation) =>
          evaluation.internshipId === activeInternship.id &&
          evaluation.status === "draft" &&
          new Date(evaluation.dueDate) > today
      )
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

    return NextResponse.json({
      hasActiveInternship: true,
      activeInternship: {
        id: activeInternship.id,
        companyName: company?.name || "Unknown Company",
        position: activeInternship.position,
        department: activeInternship.department,
        startDate: activeInternship.startDate,
        endDate: activeInternship.endDate,
      },
      duration: {
        totalWeeks,
        weeksCompleted: Math.max(0, weeksCompleted),
      },
      attendance: {
        percentage: attendancePercentage,
        present: presentCount,
        total: totalDays,
      },
      rating: averageRating,
      attendanceChart,
      upcomingEvaluation: upcomingEvaluation
        ? {
            dueDate: upcomingEvaluation.dueDate,
            evaluationDate: upcomingEvaluation.evaluationDate,
          }
        : null,
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching dashboard data" },
      { status: 500 }
    )
  }
}

