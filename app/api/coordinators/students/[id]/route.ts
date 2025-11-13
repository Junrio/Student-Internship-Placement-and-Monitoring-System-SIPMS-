import { NextRequest, NextResponse } from "next/server"
import { getUserById, getUserByEmail } from "@/db/queries/users"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"
import { getCompanyById } from "@/db/queries/companies"
import { getAttendanceByInternship } from "@/db/queries/attendance"
import { updateUser } from "@/db/queries/users"
import { updateInternship } from "@/db/queries/internships"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const studentId = parseInt(id, 10)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    // Get user data
    const user = await getUserById(studentId)
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Get all internships
    const allInternships = await getInternshipsByStudent(studentId)
    const activeInternship = allInternships.find((i) => i.status === "active")

    // Get all internships with full details
    const internshipsWithDetails = await Promise.all(
      allInternships.map(async (internship) => {
        const company = await getCompanyById(internship.companyId)
        const supervisor = await getUserById(internship.supervisorId)
        const attendance = await getAttendanceByInternship(internship.id)
        
        // Calculate attendance summary
        const presentCount = attendance.filter((r) => r.status === "present").length
        const absentCount = attendance.filter((r) => r.status === "absent").length
        const leaveCount = attendance.filter((r) => r.status === "leave").length
        const totalDays = presentCount + absentCount + leaveCount
        const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : "0"

        return {
          id: internship.id,
          internshipId: internship.internshipId,
          position: internship.position,
          department: internship.department,
          startDate: internship.startDate,
          endDate: internship.endDate,
          status: internship.status,
          description: internship.description || "",
          responsibilities: internship.responsibilities || [],
          requirements: internship.requirements || [],
          createdAt: internship.createdAt,
          updatedAt: internship.updatedAt,
          company: company
            ? {
                id: company.id,
                name: company.name,
                email: company.email,
                phone: company.phone,
                address: company.address,
                city: company.city,
                state: company.state,
                country: company.country,
                industry: company.industry,
                website: company.website || "",
              }
            : null,
          supervisor: supervisor
            ? {
                id: supervisor.id,
                name: supervisor.name,
                email: supervisor.email,
                phone: supervisor.phone || "",
              }
            : null,
          attendance: {
            totalRecords: attendance.length,
            present: presentCount,
            absent: absentCount,
            leave: leaveCount,
            percentage: attendancePercentage,
            recentRecords: attendance.slice(0, 10).map((record) => ({
              id: record.id,
              date: record.date,
              status: record.status,
              checkInTime: record.checkInTime || "",
              checkOutTime: record.checkOutTime || "",
              notes: record.notes || "",
            })),
          },
        }
      })
    )

    // Get all evaluations with full details
    const allEvaluations = await getEvaluationsByStudent(studentId) || []
    const evaluationsWithDetails = allEvaluations.map((evaluation) => {
      const evaluator = allInternships.find((i) => i.id === evaluation.internshipId)
      return {
        id: evaluation.id,
        evaluationId: evaluation.evaluationId,
        date: evaluation.evaluationDate,
        dueDate: evaluation.dueDate,
        overallRating: evaluation.overallRating,
        status: evaluation.status,
        feedback: evaluation.feedback,
        categories: evaluation.categories || [],
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt,
      }
    })

    return NextResponse.json({
      student: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      internships: internshipsWithDetails,
      activeInternship: activeInternship
        ? internshipsWithDetails.find((i) => i.id === activeInternship.id) || null
        : null,
      evaluations: evaluationsWithDetails,
      totalEvaluations: evaluationsWithDetails.length,
      summary: {
        totalInternships: allInternships.length,
        activeInternships: allInternships.filter((i) => i.status === "active").length,
        completedInternships: allInternships.filter((i) => i.status === "completed").length,
        totalEvaluations: evaluationsWithDetails.length,
        averageRating:
          evaluationsWithDetails.length > 0
            ? (
                evaluationsWithDetails
                  .filter((e) => e.status === "reviewed")
                  .reduce((sum, e) => sum + e.overallRating, 0) /
                evaluationsWithDetails.filter((e) => e.status === "reviewed").length
              ).toFixed(1)
            : "0",
      },
    })
  } catch (error) {
    console.error("Fetch student details error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching student details" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const studentId = parseInt(id, 10)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, phone, position, department, startDate, endDate, status } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Check if user exists
    const user = await getUserById(studentId)
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await getUserByEmail(email)
      if (existingUser && existingUser.id !== studentId) {
        return NextResponse.json({ error: "Email is already taken by another user" }, { status: 400 })
      }
    }

    // Update user data
    const updatedUser = await updateUser(studentId, {
      name,
      email,
      phone: phone || null,
    })

    // Update internship if provided
    if (position || department || startDate || endDate || status) {
      const internships = await getInternshipsByStudent(studentId)
      const activeInternship = internships.find((i) => i.status === "active")
      
      if (activeInternship) {
        await updateInternship(activeInternship.id, {
          position: position || undefined,
          department: department || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status: status ? (status.toLowerCase() as any) : undefined,
        })
      }
    }

    // Revalidate paths
    revalidatePath("/dashboard/coordinator/students")
    revalidatePath("/dashboard/coordinator/students/[id]")
    revalidatePath("/dashboard/coordinator")
    revalidatePath("/api/coordinators/students")

    return NextResponse.json({
      success: true,
      message: "Student updated successfully",
      student: updatedUser,
    })
  } catch (error: any) {
    console.error("Update student error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while updating student" },
      { status: 500 }
    )
  }
}

