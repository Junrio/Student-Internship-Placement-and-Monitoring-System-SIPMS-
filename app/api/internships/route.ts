import { NextRequest, NextResponse } from "next/server"
import { createInternship } from "@/db/queries/internships"
import { revalidatePath } from "next/cache"
import { getCompanyById, getAllCompanies, createCompany } from "@/db/queries/companies"
import { getUsersByRole, getUserByEmail, getUserById } from "@/db/queries/users"
import { like, or } from "drizzle-orm"
import { users, companies } from "@/db/schema"
import { db } from "@/db/index"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Support both old format (IDs) and new format (names)
    const { 
      studentId, 
      studentIds, // array of student IDs for multiple students
      companyId, 
      supervisorId, 
      company, // company name
      supervisor, // supervisor name
      position, 
      department, 
      startDate, 
      endDate, 
      status 
    } = body

    // Validate required fields
    if (!position || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Position, Start Date, and End Date are required" },
        { status: 400 }
      )
    }

    let finalCompanyId: number
    let finalSupervisorId: number
    let finalStudentId: number | null = null
    let finalDepartment = department || "General"

    // Handle company - look up by name or use ID
    if (companyId) {
      finalCompanyId = parseInt(companyId)
      const companyExists = await getCompanyById(finalCompanyId)
      if (!companyExists) {
        return NextResponse.json({ error: "Company not found" }, { status: 400 })
      }
    } else if (company) {
      // Look up company by name
      const allCompanies = await getAllCompanies()
      let foundCompany = allCompanies.find(c => c.name.toLowerCase() === company.toLowerCase())
      
      if (!foundCompany) {
        // Create company if it doesn't exist
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
    } else {
      return NextResponse.json(
        { error: "Company name or ID is required" },
        { status: 400 }
      )
    }

    // Handle supervisor - look up by name or use ID
    if (supervisorId) {
      finalSupervisorId = parseInt(supervisorId)
      const supervisorExists = await getUserById(finalSupervisorId)
      if (!supervisorExists || supervisorExists.role !== "supervisor") {
        return NextResponse.json({ error: "Supervisor not found" }, { status: 400 })
      }
    } else if (supervisor) {
      // Look up supervisor by name (users with role supervisor)
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
    } else {
      return NextResponse.json(
        { error: "Supervisor name or ID is required" },
        { status: 400 }
      )
    }

    // Generate unique internship ID
    const internshipId = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Handle student assignment - optional for create (students assigned via placement page)
    // If studentId or studentIds provided, use them (for backward compatibility)
    let studentIdList: number[] = []
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      studentIdList = studentIds.map(id => parseInt(id.toString()))
    } else if (studentId) {
      studentIdList = [parseInt(studentId.toString())]
    }
    
    // If no students provided, create a template internship
    // Since schema requires studentId, we'll need to get a placeholder student
    // For now, get the first available student as a placeholder (this will be replaced when students are assigned via placement)
    if (studentIdList.length === 0) {
      // Get first available student to use as placeholder (required by schema)
      const allStudents = await getUsersByRole("student")
      if (allStudents.length === 0) {
        return NextResponse.json(
          { error: "No students available. Please add students first, or assign students via the Placement page after creating the internship." },
          { status: 400 }
        )
      }
      // Use first student as placeholder - this internship will be used as a template
      // When students are assigned via placement page, new internship records will be created
      studentIdList = [allStudents[0].id]
    }

    // Verify all students exist
    for (const sid of studentIdList) {
      const student = await getUserById(sid)
      if (!student || student.role !== "student") {
        return NextResponse.json(
          { error: `Invalid student ID: ${sid}. Student not found.` },
          { status: 400 }
        )
      }
    }

    // Create one internship per student (or template internship if no students specified)
    const createdInternships = []
    for (let i = 0; i < studentIdList.length; i++) {
      const studentId = studentIdList[i]
      const newInternshipId = i === 0 ? internshipId : `${internshipId}-${i + 1}`
      
      const newInternship = await createInternship({
        internshipId: newInternshipId,
        studentId: studentId,
        companyId: finalCompanyId,
        supervisorId: finalSupervisorId,
        position,
        department: finalDepartment,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: (status || "pending") as any,
      })
      
      createdInternships.push(newInternship)
    }

    // Revalidate paths to refresh data
    revalidatePath("/dashboard/coordinator/internships")
    revalidatePath("/dashboard/coordinator/placements")
    revalidatePath("/dashboard/coordinator")
    revalidatePath("/api/coordinators/internships")
    revalidatePath("/api/coordinators/placements")

    return NextResponse.json(
      {
        success: true,
        message: `Internship created successfully. ${studentIdList.length === 0 ? "Assign students using the Placement page." : ""}`,
        count: createdInternships.length,
        internships: createdInternships,
        internship: createdInternships[0], // For backward compatibility
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Create internship error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred during internship creation" },
      { status: 500 }
    )
  }
}



