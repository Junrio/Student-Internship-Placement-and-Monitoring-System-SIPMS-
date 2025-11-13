"use client"

import { useEffect, useState } from "react"
import { MessagingPanel } from "@/components/messaging-panel"

export default function MessagesPage() {
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    // Get user info from cookies
    const email =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("userEmail="))
        ?.split("=")[1] || ""
    const role =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("userRole="))
        ?.split("=")[1] || ""
    setUserEmail(email)
    setUserId(`${role}_${Date.now()}`) // Simplified user ID
  }, [])

  if (!userEmail) return null

  return <MessagingPanel userId={userId} userName={userEmail} />
}
