"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"

type UserRole = "student" | "coordinator" | "supervisor" | "admin"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication and role from cookies
    const roleFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userRole="))
      ?.split("=")[1] as UserRole | undefined

    const isLoggedIn =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("isLoggedIn="))
        ?.split("=")[1] === "true"

    if (!isLoggedIn) {
      router.push("/")
      return
    }

    if (!roleFromCookie) {
      router.push("/")
      return
    }

    // Verify role matches URL
    const expectedRole = pathname.split("/")[2] as UserRole
    if (roleFromCookie !== expectedRole) {
      router.push(`/dashboard/${roleFromCookie}`)
      return
    }

    setRole(roleFromCookie)
    setIsLoading(false)
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!role) {
    return null
  }

  return <DashboardLayout role={role}>{children}</DashboardLayout>
}
