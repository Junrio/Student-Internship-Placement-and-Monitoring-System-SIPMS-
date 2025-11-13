import { NextRequest, NextResponse } from "next/server"
import { users } from "@/db/schema"
import { db } from "@/db/index"
import { desc, eq, or, like, and, sql } from "drizzle-orm"
import { getUserByEmail, hashPassword } from "@/db/queries/users"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roleFilter = searchParams.get("role") || "all"
    const searchQuery = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const offset = (page - 1) * limit

    // Build query conditions
    let whereConditions: any[] = []

    // Role filter
    if (roleFilter !== "all") {
      whereConditions.push(eq(users.role, roleFilter as any))
    }

    // Search filter
    if (searchQuery) {
      whereConditions.push(
        or(
          like(users.name, `%${searchQuery}%`),
          like(users.email, `%${searchQuery}%`)
        )!
      )
    }

    // Get total count for pagination
    let countQuery = db.select().from(users)
    if (whereConditions.length > 0) {
      countQuery = countQuery.where(and(...whereConditions)!) as any
    }
    const allMatchingUsers = await countQuery
    const totalCount = allMatchingUsers.length

    // Get users with pagination
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions)!) as any
    }

    const allUsers = await query

    // Format users for response
    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      dateJoined: user.createdAt,
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching users" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, phone } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate user ID
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create user
    const { createUser } = await import("@/db/queries/users")
    const newUser = await createUser({
      userId,
      name,
      email,
      password: hashedPassword,
      role: role as any,
      phone: phone || null,
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )

    // Revalidate paths
    revalidatePath("/dashboard/admin/users")
    revalidatePath("/dashboard/admin")
    revalidatePath("/api/admins/users")
  } catch (error: any) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while creating user" },
      { status: 500 }
    )
  }
}

