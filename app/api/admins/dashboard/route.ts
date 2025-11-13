import { NextRequest, NextResponse } from "next/server"
import { getUsersByRole } from "@/db/queries/users"
import { getAllInternships } from "@/db/queries/internships"
import { users, evaluations } from "@/db/schema"
import { db } from "@/db/index"
import { sql } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const allUsers = await db.select().from(users)
    const totalUsers = allUsers.length

    // Get users by role
    const students = await getUsersByRole("student")
    const coordinators = await getUsersByRole("coordinator")
    const supervisors = await getUsersByRole("supervisor")
    const admins = await getUsersByRole("admin")

    // Get all internships
    const allInternships = await getAllInternships()
    const activeInternships = allInternships.filter(
      (internship) => internship.status === "active"
    )

    // Get completed internships this year
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const completedThisYear = allInternships.filter(
      (internship) =>
        internship.status === "completed" &&
        new Date(internship.updatedAt) >= yearStart
    ).length

    // Get total evaluations count
    const allEvaluations = await db.select().from(evaluations)
    const totalEvaluations = allEvaluations.length

    // Get monthly user registrations for the last 12 months
    // Group users by month of creation
    const allUsersWithDates = await db.select({
      createdAt: users.createdAt,
    }).from(users)

    // Group by month
    const monthlyMap = new Map<string, number>()
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    allUsersWithDates.forEach((user) => {
      const userDate = new Date(user.createdAt)
      if (userDate >= twelveMonthsAgo) {
        const monthKey = `${userDate.getFullYear()}-${String(userDate.getMonth() + 1).padStart(2, "0")}`
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1)
      }
    })

    // Convert to array and format for charts
    const monthlyData = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          users: count,
        }
      })

    return NextResponse.json({
      totalUsers,
      students: students.length,
      coordinators: coordinators.length,
      supervisors: supervisors.length,
      admins: admins.length,
      activeInternships: activeInternships.length,
      completedThisYear,
      totalEvaluations,
      monthlyRegistrations: monthlyData,
    })
  } catch (error) {
    console.error("Admin dashboard data error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching dashboard data" },
      { status: 500 }
    )
  }
}

