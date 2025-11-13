import { NextRequest, NextResponse } from "next/server"
import { getAllInternships } from "@/db/queries/internships"
import { getCompanyById } from "@/db/queries/companies"
import { getUserById } from "@/db/queries/users"
import { updateInternship } from "@/db/queries/internships"

export async function GET(request: NextRequest) {
  try {
    const allInternships = await getAllInternships()

    // Enrich internships with student and company data for placements view
    const enrichedPlacements = await Promise.all(
      allInternships.map(async (internship) => {
        const student = await getUserById(internship.studentId)
        const company = await getCompanyById(internship.companyId)

        // Map internship status to placement status
        // pending -> pending, active -> confirmed, terminated -> rejected
        let placementStatus = "pending"
        if (internship.status === "active") {
          placementStatus = "confirmed"
        } else if (internship.status === "terminated") {
          placementStatus = "rejected"
        }

        return {
          id: internship.id,
          studentName: student?.name || "Unknown Student",
          company: company?.name || "Unknown Company",
          position: internship.position,
          status: placementStatus,
          startDate: internship.startDate,
          endDate: internship.endDate,
          internshipId: internship.id, // For updating status
        }
      })
    )

    return NextResponse.json({ placements: enrichedPlacements })
  } catch (error) {
    console.error("Coordinator placements error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching placements" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { internshipId, status } = body

    if (!internshipId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: internshipId and status" },
        { status: 400 }
      )
    }

    // Map placement status to internship status
    let internshipStatus = "pending"
    if (status === "confirmed") {
      internshipStatus = "active"
    } else if (status === "rejected") {
      internshipStatus = "terminated"
    }

    const updated = await updateInternship(internshipId, { status: internshipStatus as any })

    if (!updated) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, placement: updated })
  } catch (error) {
    console.error("Update placement error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating placement" },
      { status: 500 }
    )
  }
}





