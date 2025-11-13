import { NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail, hashPassword } from "@/db/queries/users"
import { revalidatePath } from "next/cache"

function generateUserId(role: string): string {
  const prefix = role.toUpperCase().substring(0, 3)
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, phone } = body

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, password, name, and role are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ["student", "coordinator", "supervisor", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: student, coordinator, supervisor, admin" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Generate unique user ID
    const userId = generateUserId(role)

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await createUser({
      userId,
      email,
      password: hashedPassword,
      name,
      role: role as "student" | "coordinator" | "supervisor" | "admin",
      phone: phone || null,
    })

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser

    // Revalidate admin dashboard to reflect new user
    revalidatePath("/dashboard/admin")
    revalidatePath("/api/admins/dashboard")

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Signup error:", error)
    
    // Handle unique constraint violations
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "User with this email or user ID already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}

