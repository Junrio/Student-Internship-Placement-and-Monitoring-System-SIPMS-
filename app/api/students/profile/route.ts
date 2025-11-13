import { NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/db/queries/users"

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

    const user = await getUserById(studentId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        studentNumber: (user as any).studentNumber || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
      },
    })
  } catch (error) {
    console.error("Student profile error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = request.cookies.get("userId")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    // In a real implementation, update the user in the database
    // For now, just return success

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    )
  }
}




