import { NextRequest, NextResponse } from "next/server"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getAttendanceByInternship } from "@/db/queries/attendance"

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

    // Get active internship
    const internships = await getInternshipsByStudent(studentId)
    const activeInternship = internships.find((i) => i.status === "active")

    if (!activeInternship) {
      return NextResponse.json({
        attendanceSummary: { present: 0, absent: 0, leave: 0 },
        weeklyAttendance: [],
        attendancePercentage: 0,
      })
    }

    // Get attendance records
    const attendanceRecords = await getAttendanceByInternship(activeInternship.id)

    // Calculate summary
    const present = attendanceRecords.filter((r) => r.status === "present").length
    const absent = attendanceRecords.filter((r) => r.status === "absent").length
    const leave = attendanceRecords.filter((r) => r.status === "leave").length
    const totalDays = present + absent + leave
    const attendancePercentage = totalDays > 0 ? ((present / totalDays) * 100).toFixed(1) : "0"

    // Calculate weekly attendance for the past 6 weeks
    const weeklyAttendance = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
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

      weeklyAttendance.push({
        week: `Week ${6 - i}`,
        present: weekRecords.filter((r) => r.status === "present").length,
        absent: weekRecords.filter((r) => r.status === "absent").length,
        leave: weekRecords.filter((r) => r.status === "leave").length,
      })
    }

    return NextResponse.json({
      attendanceSummary: { present, absent, leave },
      weeklyAttendance,
      attendancePercentage: parseFloat(attendancePercentage),
    })
  } catch (error) {
    console.error("Student attendance error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching attendance" },
      { status: 500 }
    )
  }
}





