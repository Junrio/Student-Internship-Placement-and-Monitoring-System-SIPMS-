import { eq, desc } from "drizzle-orm"
import { db } from "../index"
import { evaluations, type Evaluation, type NewEvaluation } from "../schema"

export async function getEvaluationsByInternship(internshipId: number): Promise<Evaluation[]> {
  return await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.internshipId, internshipId))
    .orderBy(desc(evaluations.createdAt))
}

export async function getEvaluationById(id: number): Promise<Evaluation | null> {
  const result = await db.select().from(evaluations).where(eq(evaluations.id, id)).limit(1)
  return result[0] || null
}

export async function getEvaluationByEvaluationId(evaluationId: string): Promise<Evaluation | null> {
  const result = await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.evaluationId, evaluationId))
    .limit(1)
  return result[0] || null
}

export async function createEvaluation(evaluationData: NewEvaluation): Promise<Evaluation> {
  const result = await db.insert(evaluations).values(evaluationData).returning()
  return result[0]
}

export async function updateEvaluation(
  id: number,
  evaluationData: Partial<NewEvaluation>
): Promise<Evaluation | null> {
  const result = await db
    .update(evaluations)
    .set({ ...evaluationData, updatedAt: new Date() })
    .where(eq(evaluations.id, id))
    .returning()
  return result[0] || null
}

export async function getEvaluationsByStudent(studentId: number): Promise<Evaluation[]> {
  return await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.studentId, studentId))
    .orderBy(desc(evaluations.createdAt))
}

export async function getEvaluationsByEvaluator(evaluatorId: number): Promise<Evaluation[]> {
  return await db
    .select()
    .from(evaluations)
    .where(eq(evaluations.evaluatorId, evaluatorId))
    .orderBy(desc(evaluations.createdAt))
}






