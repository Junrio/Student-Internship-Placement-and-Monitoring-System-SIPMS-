"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import type React from "react"

type UserRole = "student" | "coordinator" | "supervisor" | "admin"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
}

const navigationItems: Record<UserRole, { label: string; href: string }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard/student" },
    { label: "Internships", href: "/dashboard/student/internships" },
    { label: "Attendance", href: "/dashboard/student/attendance" },
    { label: "Evaluations", href: "/dashboard/student/evaluations" },
  ],
  coordinator: [
    { label: "Dashboard", href: "/dashboard/coordinator" },
    { label: "Students", href: "/dashboard/coordinator/students" },
    { label: "Internships", href: "/dashboard/coordinator/internships" },
    { label: "Placements", href: "/dashboard/coordinator/placements" },
  ],
  supervisor: [
    { label: "Dashboard", href: "/dashboard/supervisor" },
    { label: "Interns", href: "/dashboard/supervisor/interns" },
    { label: "Evaluations", href: "/dashboard/supervisor/evaluations" },
    { label: "Reports", href: "/dashboard/supervisor/reports" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin" },
    { label: "Users", href: "/dashboard/admin/users" },
    { label: "System", href: "/dashboard/admin/system" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
  ],
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Get user info from cookies
    const email =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("userEmail="))
        ?.split("=")[1] || ""
    setUserEmail(email)
  }, [])

  const handleLogout = useCallback(() => {
    // Clear auth cookies
    document.cookie = "isLoggedIn=; path=/; max-age=0"
    document.cookie = "userRole=; path=/; max-age=0"
    document.cookie = "userEmail=; path=/; max-age=0"
    router.push("/")
  }, [router])

  const items = navigationItems[role]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground w-64 min-h-screen transition-all duration-300 border-r border-sidebar-border flex flex-col",
          !isSidebarOpen && "-ml-64",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg">SIPMS</h2>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {items.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive/10 bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border h-16 px-6 flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="text-sm text-muted-foreground">{userEmail}</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
