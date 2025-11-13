import { eq, and, desc } from "drizzle-orm"
import { db } from "../index"
import { internships, companies, users, type Internship, type NewInternship } from "../schema"

export async function getInternshipsByStudent(studentId: number): Promise<Internship[]> {
  return await db
    .select()
    .from(internships)
    .where(eq(internships.studentId, studentId))
    .orderBy(desc(internships.createdAt))
}

export async function getInternshipById(id: number): Promise<Internship | null> {
  const result = await db.select().from(internships).where(eq(internships.id, id)).limit(1)
  return result[0] || null
}

export async function getInternshipByInternshipId(internshipId: string): Promise<Internship | null> {
  const result = await db
    .select()
    .from(internships)
    .where(eq(internships.internshipId, internshipId))
    .limit(1)
  return result[0] || null
}

export async function createInternship(internshipData: NewInternship): Promise<Internship> {
  const result = await db.insert(internships).values(internshipData).returning()
  return result[0]
}

export async function updateInternship(
  id: number,
  internshipData: Partial<NewInternship>
): Promise<Internship | null> {
  const result = await db
    .update(internships)
    .set({ ...internshipData, updatedAt: new Date() })
    .where(eq(internships.id, id))
    .returning()
  return result[0] || null
}

export async function getInternshipsBySupervisor(supervisorId: number): Promise<Internship[]> {
  return await db
    .select()
    .from(internships)
    .where(eq(internships.supervisorId, supervisorId))
    .orderBy(desc(internships.createdAt))
}

export async function getAllInternships(): Promise<Internship[]> {
  return await db.select().from(internships).orderBy(desc(internships.createdAt))
}






