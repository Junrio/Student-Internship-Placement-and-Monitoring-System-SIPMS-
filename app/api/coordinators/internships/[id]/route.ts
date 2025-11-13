import { NextRequest, NextResponse } from "next/server"
import { getInternshipById, getAllInternships } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"
import { getUserById } from "@/db/queries/users"
import { getAttendanceByInternship } from "@/db/queries/attendance"
import { getEvaluationsByInternship } from "@/db/queries/evaluations"
import { eq } from "drizzle-orm"
import { db } from "@/db/index"
import { internships } from "@/db/schema"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const internshipId = parseInt(id, 10)

    if (isNaN(internshipId)) {
      return NextResponse.json({ error: "Invalid internship ID" }, { status: 400 })
    }

    // Get the internship
    const internship = await getInternshipById(internshipId)
    if (!internship) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 })
    }

    // Get company information
    const company = await getCompanyById(internship.companyId)

    // Get supervisor information
    const supervisor = await getUserById(internship.supervisorId)

    // Get all internships with the same internshipId (all students assigned to this internship program)
    const allInternshipsWithSameId = await db
      .select()
      .from(internships)
      .where(eq(internships.internshipId, internship.internshipId))

    // Get students assigned to this internship
    const studentsData = await Promise.all(
      allInternshipsWithSameId.map(async (intern) => {
        const student = await getUserById(intern.studentId)
        if (!student) return null

        // Get attendance records for this student's internship
        const attendanceRecords = await getAttendanceByInternship(intern.id)
        const presentCount = attendanceRecords.filter((r) => r.status === "present").length
        const totalDays = attendanceRecords.length
        const hoursLogged = presentCount * 8 // Assuming 8 hours per day

        // Calculate progress based on dates
        const startDate = new Date(intern.startDate)
        const endDate = new Date(intern.endDate)
        const today = new Date()
        const totalDaysInInternship = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        const daysElapsed = Math.max(
          0,
          Math.min(
            Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
            totalDaysInInternship
          )
        )
        const progress = totalDaysInInternship > 0 
          ? Math.round((daysElapsed / totalDaysInInternship) * 100)
          : 0

        return {
          id: student.id,
          name: student.name,
          email: student.email,
          progress: Math.min(progress, 100),
          hoursLogged,
        }
      })
    )

    // Filter out null values
    const students = studentsData.filter((s) => s !== null) as Array<{
      id: number
      name: string
      email: string
      progress: number
      hoursLogged: number
    }>

    // Format company address
    const companyAddress = company
      ? `${company.address}, ${company.city}, ${company.state} ${company.country}`
      : "Address not available"

    return NextResponse.json({
      internship: {
        id: internship.id,
        company: company?.name || "Unknown Company",
        position: internship.position,
        department: internship.department,
        studentCount: students.length,
        status: internship.status,
        startDate: internship.startDate,
        endDate: internship.endDate,
        supervisor: supervisor?.name || "Unknown Supervisor",
        supervisorEmail: supervisor?.email || "Email not available",
        supervisorPhone: supervisor?.phone || "Phone not available",
        companyAddress,
        description: internship.description || "No description available.",
        students,
      },
    })
  } catch (error) {
    console.error("Get internship details error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching internship details" },
      { status: 500 }
    )
  }
}




