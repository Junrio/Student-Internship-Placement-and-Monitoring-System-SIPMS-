import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/index"
import { users } from "@/db/schema"

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    let databaseStatus = "Disconnected"
    try {
      await db.select().from(users).limit(1)
      databaseStatus = "Connected"
    } catch (error) {
      console.error("Database connection error:", error)
      databaseStatus = "Disconnected"
    }

    // Check server status (always operational if we can respond)
    const serverStatus = "Operational"

    // Check API status
    const apiStatus = "Running"

    return NextResponse.json({
      server: {
        status: serverStatus,
        uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      },
      database: {
        status: databaseStatus,
        lastChecked: new Date().toISOString(),
      },
      api: {
        status: apiStatus,
        version: "1.0.0",
      },
    })
  } catch (error) {
    console.error("System status error:", error)
    return NextResponse.json(
      {
        server: { status: "Unknown", uptime: 0 },
        database: { status: "Unknown", lastChecked: new Date().toISOString() },
        api: { status: "Unknown", version: "1.0.0" },
      },
      { status: 500 }
    )
  }
}





