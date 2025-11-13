export interface AttendanceRecord {
  id: string
  internshipId: string
  date: string
  status: "present" | "absent" | "leave" | "holiday"
  checkInTime?: string
  checkOutTime?: string
  notes?: string
  markedBy: string
  createdAt: string
}

export interface AttendanceSummary {
  totalDays: number
  presentDays: number
  absentDays: number
  leaveDays: number
  attendancePercentage: number
}

// In-memory data store
export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    internshipId: "1",
    date: "2025-02-10",
    status: "present",
    checkInTime: "09:00",
    checkOutTime: "17:30",
    markedBy: "john_001",
    createdAt: "2025-02-10",
  },
]

export function getAttendanceByInternship(internshipId: string): AttendanceRecord[] {
  return attendanceRecords.filter((r) => r.internshipId === internshipId)
}

export function calculateAttendanceSummary(internshipId: string): AttendanceSummary {
  const records = getAttendanceByInternship(internshipId)
  const totalDays = records.length
  const presentDays = records.filter((r) => r.status === "present").length
  const absentDays = records.filter((r) => r.status === "absent").length
  const leaveDays = records.filter((r) => r.status === "leave").length

  return {
    totalDays,
    presentDays,
    absentDays,
    leaveDays,
    attendancePercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
  }
}

export function markAttendance(data: Omit<AttendanceRecord, "id" | "createdAt">): AttendanceRecord {
  const record: AttendanceRecord = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }
  attendanceRecords.push(record)
  return record
}

export function updateAttendance(id: string, data: Partial<AttendanceRecord>): AttendanceRecord | undefined {
  const index = attendanceRecords.findIndex((r) => r.id === id)
  if (index === -1) return undefined
  attendanceRecords[index] = { ...attendanceRecords[index], ...data }
  return attendanceRecords[index]
}
