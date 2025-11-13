import { NextRequest, NextResponse } from "next/server"
import { getAllInternships } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"
import { getUserById } from "@/db/queries/users"
import { eq } from "drizzle-orm"
import { db } from "@/db/index"
import { internships } from "@/db/schema"

export async function GET(request: NextRequest) {
  try {
    const allInternships = await getAllInternships()

    // Group internships by internshipId to count students
    const internshipGroups = new Map<string, number>()
    allInternships.forEach((internship) => {
      const count = internshipGroups.get(internship.internshipId) || 0
      internshipGroups.set(internship.internshipId, count + 1)
    })

    // Enrich internships with company, supervisor, and student count
    // Only return unique internships (one per internshipId)
    const seenInternshipIds = new Set<string>()
    const enrichedInternships = []

    for (const internship of allInternships) {
      if (seenInternshipIds.has(internship.internshipId)) continue
      seenInternshipIds.add(internship.internshipId)

      const company = await getCompanyById(internship.companyId)
      const supervisor = await getUserById(internship.supervisorId)

      enrichedInternships.push({
        id: internship.id,
        company: company?.name || "Unknown Company",
        position: internship.position,
        studentCount: internshipGroups.get(internship.internshipId) || 1,
        status: internship.status,
        startDate: internship.startDate,
        endDate: internship.endDate,
        supervisor: supervisor?.name || "Unknown Supervisor",
      })
    }

    return NextResponse.json({ internships: enrichedInternships })
  } catch (error) {
    console.error("Coordinator internships error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching internships" },
      { status: 500 }
    )
  }
}

