import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/db/queries/users"
import { getInternshipsByStudent } from "@/db/queries/internships"
import { getEvaluationsByStudent } from "@/db/queries/evaluations"
import { getCompanyById } from "@/db/queries/companies"
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

    // Get internships
    const internships = await getInternshipsByStudent(studentId)
    const activeInternship = internships.find((i) => i.status === "active")
    const company = activeInternship ? await getCompanyById(activeInternship.companyId) : null
    const supervisor = activeInternship
      ? await getUserById(activeInternship.supervisorId)
      : null

    // Get evaluations (last 3)
    const allEvaluations = (await getEvaluationsByStudent(studentId)) || []
    const recentEvaluations = allEvaluations.slice(0, 3).map((evaluation) => ({
      id: evaluation.id,
      evaluationId: evaluation.evaluationId,
      date: evaluation.evaluationDate,
      overallRating: evaluation.overallRating,
      status: evaluation.status,
      feedback: evaluation.feedback,
    }))

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
      internship: activeInternship
        ? {
            id: activeInternship.id,
            companyName: company?.name || "",
            position: activeInternship.position,
            department: activeInternship.department,
            startDate: activeInternship.startDate,
            endDate: activeInternship.endDate,
            status: activeInternship.status,
            supervisorName: supervisor?.name || "",
            supervisorId: activeInternship.supervisorId,
          }
        : null,
      evaluations: recentEvaluations,
      totalEvaluations: allEvaluations.length,
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

