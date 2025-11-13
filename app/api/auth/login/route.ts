import { NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/db/queries/users"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })

    // Set cookies
    response.cookies.set("isLoggedIn", "true", {
      path: "/",
      httpOnly: false, // Set to true if you want httpOnly cookies
      sameSite: "lax",
    })
    response.cookies.set("userRole", user.role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    })
    response.cookies.set("userEmail", user.email, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    })
    response.cookies.set("userId", user.id.toString(), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}








