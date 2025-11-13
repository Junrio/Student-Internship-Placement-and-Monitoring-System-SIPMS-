import { NextRequest, NextResponse } from "next/server"
import { createUser, hashPassword, getUserByEmail, getUserByUserId } from "@/db/queries/users"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, studentId, program, yearLevel, email, contact, coordinatorId } = body

    // Validation
    if (!name || !studentId || !email) {
      return NextResponse.json({ error: "Name, Student ID, and Email are required" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 })
    }

    // Check if userId (studentId) already exists
    const existingUserId = await getUserByUserId(studentId)
    if (existingUserId) {
      return NextResponse.json({ error: "A user with this Student ID already exists" }, { status: 400 })
    }

    // Generate default password (using studentId as base)
    const defaultPassword = `${studentId}@SIPMS`
    const hashedPassword = await hashPassword(defaultPassword)

    // Create user account with student role
    const newUser = await createUser({
      userId: studentId,
      email,
      password: hashedPassword,
      name,
      role: "student",
      phone: contact || null,
    })

    // Revalidate paths to refresh data
    revalidatePath("/dashboard/coordinator/students")
    revalidatePath("/dashboard/coordinator")
    revalidatePath("/api/coordinators/students")

    return NextResponse.json(
      {
        success: true,
        message: "Student created successfully",
        student: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          studentId: newUser.userId,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Create student error:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred during student creation" },
      { status: 500 }
    )
  }
}



