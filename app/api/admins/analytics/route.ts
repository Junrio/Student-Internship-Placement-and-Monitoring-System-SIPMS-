import { NextRequest, NextResponse } from "next/server"
import { getUsersByRole } from "@/db/queries/users"
import { getAllInternships } from "@/db/queries/internships"
import { users, evaluations, internships } from "@/db/schema"
import { db } from "@/db/index"
import { eq } from "drizzle-orm"

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
    const activeInternships = allInternships.filter((i) => i.status === "active")
    const completedInternships = allInternships.filter((i) => i.status === "completed")

    // Get evaluations
    const allEvaluations = await db.select().from(evaluations)
    const reviewedEvaluations = allEvaluations.filter((e) => e.status === "reviewed")

    // Calculate average evaluation score
    let averageScore = null
    if (reviewedEvaluations.length > 0) {
      const totalScore = reviewedEvaluations.reduce((sum, e) => sum + e.overallRating, 0)
      averageScore = (totalScore / reviewedEvaluations.length).toFixed(1)
    }

    // Get monthly user registrations
    const allUsersWithDates = await db.select({ createdAt: users.createdAt }).from(users)
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

    const monthlyRegistrations = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          users: count,
        }
      })

    // Get monthly evaluation submissions
    const monthlyEvalMap = new Map<string, number>()
    reviewedEvaluations.forEach((evaluation) => {
      const evalDate = new Date(evaluation.createdAt)
      if (evalDate >= twelveMonthsAgo) {
        const monthKey = `${evalDate.getFullYear()}-${String(evalDate.getMonth() + 1).padStart(2, "0")}`
        monthlyEvalMap.set(monthKey, (monthlyEvalMap.get(monthKey) || 0) + 1)
      }
    })

    const monthlyEvaluations = Array.from(monthlyEvalMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split("-")
        const date = new Date(parseInt(year), parseInt(month) - 1, 1)
        return {
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          evaluations: count,
        }
      })

    // Get internship distribution by department
    const departmentMap = new Map<string, number>()
    allInternships.forEach((internship) => {
      const dept = internship.department || "Unknown"
      departmentMap.set(dept, (departmentMap.get(dept) || 0) + 1)
    })

    const departmentDistribution = Array.from(departmentMap.entries())
      .map(([department, count]) => ({
        department,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    // Role distribution
    const roleDistribution = [
      { name: "Students", value: students.length, color: "#002F6C" },
      { name: "Coordinators", value: coordinators.length, color: "#001F3F" },
      { name: "Supervisors", value: supervisors.length, color: "#E6F0FF" },
      { name: "Admins", value: admins.length, color: "#002F6C" },
    ]

    // Calculate placement rate
    const placementRate =
      students.length > 0 ? Math.round((activeInternships.length / students.length) * 100) : 0

    return NextResponse.json({
      totalUsers,
      activeInternships: activeInternships.length,
      averageScore,
      placementRate,
      monthlyRegistrations,
      monthlyEvaluations,
      departmentDistribution,
      roleDistribution,
      totalEvaluations: allEvaluations.length,
      completedInternships: completedInternships.length,
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching analytics" },
      { status: 500 }
    )
  }
}

