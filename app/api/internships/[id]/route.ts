import { NextRequest, NextResponse } from "next/server"
import { getInternshipById, updateInternship, getAllInternships, createInternship } from "@/db/queries/internships"
import { getCompanyById, getAllCompanies, createCompany } from "@/db/queries/companies"
import { getUsersByRole, getUserById } from "@/db/queries/users"
import { eq } from "drizzle-orm"
import { db } from "@/db/index"
import { internships } from "@/db/schema"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const internshipId = parseInt(id, 10)

    if (isNaN(internshipId)) {
      return NextResponse.json({ error: "Invalid internship ID" }, { status: 400 })
    }

    const internship = await getInternshipById(internshipId)

    if (!internship) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 })
    }

    return NextResponse.json({ internship })
  } catch (error: any) {
    console.error("Get internship error:", error)
    return NextResponse.json({ error: "An error occurred while fetching internship" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const internshipId = parseInt(id, 10)
    const body = await request.json()

    if (isNaN(internshipId)) {
      return NextResponse.json({ error: "Invalid internship ID" }, { status: 400 })
    }

    // Get the current internship to find its internshipId (for grouping)
    const currentInternship = await getInternshipById(internshipId)
    if (!currentInternship) {
      return NextResponse.json({ error: "Internship not found" }, { status: 404 })
    }

    const {
      company,
      position,
      supervisor,
      startDate,
      endDate,
      status,
      studentIds, // array of student IDs
    } = body

    // Validate student IDs
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "At least one student must be selected" },
        { status: 400 }
      )
    }

    // Convert student IDs to numbers
    const newStudentIds = studentIds.map((id: string | number) => parseInt(id.toString()))

    // Verify all students exist
    for (const sid of newStudentIds) {
      const student = await getUserById(sid)
      if (!student || student.role !== "student") {
        return NextResponse.json(
          { error: `Invalid student ID: ${sid}. Student not found.` },
          { status: 400 }
        )
      }
    }

    // Handle company lookup/creation
    let finalCompanyId = currentInternship.companyId
    if (company && company !== currentInternship.companyId) {
      const allCompanies = await getAllCompanies()
      let foundCompany = allCompanies.find(c => c.name.toLowerCase() === company.toLowerCase())
      
      if (!foundCompany) {
        const companyIdStr = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        foundCompany = await createCompany({
          companyId: companyIdStr,
          name: company,
          email: `${company.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "000-000-0000",
          address: "Address not provided",
          city: "Unknown",
          state: "Unknown",
          country: "Unknown",
          industry: "General",
        })
      }
      finalCompanyId = foundCompany.id
    }

    // Handle supervisor lookup
    let finalSupervisorId = currentInternship.supervisorId
    if (supervisor && supervisor !== currentInternship.supervisorId) {
      const supervisors = await getUsersByRole("supervisor")
      const foundSupervisor = supervisors.find(s => 
        s.name.toLowerCase().includes(supervisor.toLowerCase()) ||
        supervisor.toLowerCase().includes(s.name.toLowerCase())
      )
      
      if (!foundSupervisor) {
        return NextResponse.json(
          { error: `Supervisor "${supervisor}" not found. Please ensure the supervisor is registered in the system.` },
          { status: 400 }
        )
      }
      finalSupervisorId = foundSupervisor.id
    }

    // Get all internships with the same internshipId (all students currently assigned)
    const allInternshipsWithSameId = await db
      .select()
      .from(internships)
      .where(eq(internships.internshipId, currentInternship.internshipId))

    const currentStudentIds = allInternshipsWithSameId.map(i => i.studentId)
    const studentsToAdd = newStudentIds.filter(id => !currentStudentIds.includes(id))
    const studentsToRemove = currentStudentIds.filter(id => !newStudentIds.includes(id))
    const studentsToKeep = newStudentIds.filter(id => currentStudentIds.includes(id))

    // Update data for all internships
    const updateData: any = {}
    if (position) updateData.position = position
    if (startDate) updateData.startDate = new Date(startDate)
    if (endDate) updateData.endDate = new Date(endDate)
    if (status) updateData.status = status
    if (finalCompanyId !== currentInternship.companyId) updateData.companyId = finalCompanyId
    if (finalSupervisorId !== currentInternship.supervisorId) updateData.supervisorId = finalSupervisorId

    // Update existing internships for students that remain
    for (const studentId of studentsToKeep) {
      const existingInternship = allInternshipsWithSameId.find(i => i.studentId === studentId)
      if (existingInternship && Object.keys(updateData).length > 0) {
        await updateInternship(existingInternship.id, updateData)
      }
    }

    // Create new internships for newly added students
    // Generate unique internshipId for each new student, but use base pattern for grouping
    const baseInternshipId = currentInternship.internshipId.split('-').slice(0, 2).join('-') // Get base pattern
    for (let i = 0; i < studentsToAdd.length; i++) {
      const studentId = studentsToAdd[i]
      // Generate unique internshipId while maintaining grouping pattern
      const newInternshipId = `${baseInternshipId}-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      await createInternship({
        internshipId: newInternshipId,
        studentId: studentId,
        companyId: finalCompanyId,
        supervisorId: finalSupervisorId,
        position: position || currentInternship.position,
        department: currentInternship.department,
        startDate: startDate ? new Date(startDate) : currentInternship.startDate,
        endDate: endDate ? new Date(endDate) : currentInternship.endDate,
        status: (status || currentInternship.status) as any,
      })
    }

    // Delete internships for students that were removed
    for (const studentId of studentsToRemove) {
      const internshipToDelete = allInternshipsWithSameId.find(i => i.studentId === studentId)
      if (internshipToDelete) {
        await db.delete(internships).where(eq(internships.id, internshipToDelete.id))
      }
    }

    // Revalidate paths
    revalidatePath("/dashboard/coordinator/internships")
    revalidatePath("/dashboard/coordinator/placements")
    revalidatePath("/dashboard/coordinator")
    revalidatePath("/api/coordinators/internships")
    revalidatePath("/api/coordinators/placements")

    const totalChanges = studentsToAdd.length + studentsToRemove.length + studentsToKeep.length

    return NextResponse.json(
      {
        success: true,
        message: "Internship updated successfully",
        count: totalChanges,
        added: studentsToAdd.length,
        removed: studentsToRemove.length,
        updated: studentsToKeep.length,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Update internship error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred during internship update" },
      { status: 500 }
    )
  }
}



