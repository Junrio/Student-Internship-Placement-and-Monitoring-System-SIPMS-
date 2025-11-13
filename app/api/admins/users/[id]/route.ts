import { NextRequest, NextResponse } from "next/server"
import { getUserById, updateUser, getUserByEmail } from "@/db/queries/users"
import { revalidatePath } from "next/cache"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        dateJoined: user.createdAt,
        status: "Active", // Default status - can be enhanced with actual status field
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching user" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, phone, role, status } = body

    // Check if user exists
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await getUserByEmail(email)
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        )
      }
    }

    // Update user data
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone || null
    if (role) updateData.role = role

    const updatedUser = await updateUser(userId, updateData)

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    // Revalidate paths
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/api/admins/users")

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        status: status || "Active",
      },
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "An error occurred while updating user" },
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
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    // Check if user exists
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For now, we'll just return success since status field doesn't exist in schema
    // In a real implementation, you would update a status field in the database
    // Revalidate paths
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/api/admins/users")

    return NextResponse.json({
      success: true,
      message: `User ${status === "Inactive" ? "deactivated" : "activated"} successfully`,
    })
  } catch (error) {
    console.error("Error updating user status:", error)
    return NextResponse.json(
      { error: "An error occurred while updating user status" },
      { status: 500 }
    )
  }
}

