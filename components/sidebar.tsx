"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  Home,
  Briefcase,
  Calendar,
  CheckSquare,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  role: "student" | "coordinator" | "supervisor" | "admin"
}

const navItems: Record<string, Array<{ icon: React.ReactNode; label: string; path: string }>> = {
  student: [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/dashboard/student" },
    { icon: <Briefcase className="w-5 h-5" />, label: "Internships", path: "/dashboard/student/internships" },
    { icon: <Calendar className="w-5 h-5" />, label: "Logbook", path: "/dashboard/student/logbook" },
    { icon: <CheckSquare className="w-5 h-5" />, label: "Evaluations", path: "/dashboard/student/evaluations" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Messages", path: "/dashboard/student/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/dashboard/student/settings" },
  ],
  coordinator: [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/dashboard/coordinator" },
    { icon: <Briefcase className="w-5 h-5" />, label: "Placements", path: "/dashboard/coordinator/placements" },
    { icon: <Calendar className="w-5 h-5" />, label: "Attendance", path: "/dashboard/coordinator/attendance" },
    { icon: <CheckSquare className="w-5 h-5" />, label: "Evaluations", path: "/dashboard/coordinator/evaluations" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Reports", path: "/dashboard/coordinator/reports" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Messages", path: "/dashboard/coordinator/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/dashboard/coordinator/settings" },
  ],
  supervisor: [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/dashboard/supervisor" },
    { icon: <Briefcase className="w-5 h-5" />, label: "Interns", path: "/dashboard/supervisor/interns" },
    { icon: <Calendar className="w-5 h-5" />, label: "Logbooks", path: "/dashboard/supervisor/logbooks" },
    { icon: <CheckSquare className="w-5 h-5" />, label: "Evaluations", path: "/dashboard/supervisor/evaluations" },
    { icon: <MessageSquare className="w-5 h-5" />, label: "Messages", path: "/dashboard/supervisor/messages" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/dashboard/supervisor/settings" },
  ],
  admin: [
    { icon: <Home className="w-5 h-5" />, label: "Dashboard", path: "/dashboard/admin" },
    { icon: <Users className="w-5 h-5" />, label: "Users", path: "/dashboard/admin/users" },
    { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics", path: "/dashboard/admin/analytics" },
    { icon: <Settings className="w-5 h-5" />, label: "System", path: "/dashboard/admin/system" },
    { icon: <FileText className="w-5 h-5" />, label: "Audit Logs", path: "/dashboard/admin/logs" },
  ],
}

const roleLabels: Record<string, string> = {
  student: "Student",
  coordinator: "Coordinator",
  supervisor: "Supervisor",
  admin: "Administrator",
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const items = navItems[role] || []

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-40 md:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center font-bold">
              S
            </div>
            <div>
              <h2 className="font-bold text-lg">SIPMS</h2>
              <p className="text-xs text-sidebar-foreground/70">{roleLabels[role]}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium group",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <span
                  className={cn(
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
