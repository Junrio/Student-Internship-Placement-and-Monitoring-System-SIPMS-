import { eq, and, desc, gte, lte } from "drizzle-orm"
import { db } from "../index"
import { attendanceRecords, type AttendanceRecord, type NewAttendanceRecord } from "../schema"

export async function getAttendanceByInternship(internshipId: number): Promise<AttendanceRecord[]> {
  return await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.internshipId, internshipId))
    .orderBy(desc(attendanceRecords.date))
}

export async function getAttendanceById(id: number): Promise<AttendanceRecord | null> {
  const result = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, id)).limit(1)
  return result[0] || null
}

export async function createAttendanceRecord(attendanceData: NewAttendanceRecord): Promise<AttendanceRecord> {
  const result = await db.insert(attendanceRecords).values(attendanceData).returning()
  return result[0]
}

export async function updateAttendanceRecord(
  id: number,
  attendanceData: Partial<NewAttendanceRecord>
): Promise<AttendanceRecord | null> {
  const result = await db
    .update(attendanceRecords)
    .set(attendanceData)
    .where(eq(attendanceRecords.id, id))
    .returning()
  return result[0] || null
}

export async function getAttendanceByDateRange(
  internshipId: number,
  startDate: Date,
  endDate: Date
): Promise<AttendanceRecord[]> {
  return await db
    .select()
    .from(attendanceRecords)
    .where(
      and(
        eq(attendanceRecords.internshipId, internshipId),
        gte(attendanceRecords.date, startDate),
        lte(attendanceRecords.date, endDate)
      )
    )
    .orderBy(desc(attendanceRecords.date))
}







