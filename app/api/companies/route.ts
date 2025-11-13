import { NextRequest, NextResponse } from "next/server"
import { getAllCompanies } from "@/db/queries/companies"

export async function GET(request: NextRequest) {
  try {
    const companies = await getAllCompanies()
    return NextResponse.json({ companies })
  } catch (error) {
    console.error("Companies error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching companies" },
      { status: 500 }
    )
  }
}




