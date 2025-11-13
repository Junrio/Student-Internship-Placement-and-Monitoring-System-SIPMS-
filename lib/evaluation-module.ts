export interface EvaluationCategory {
  name: string
  rating: number // 1-5
  weight: number // 0-1
  comments?: string
}

export interface Evaluation {
  id: string
  internshipId: string
  evaluatorId: string
  studentId: string
  evaluationDate: string
  dueDate: string
  status: "draft" | "submitted" | "reviewed"
  categories: EvaluationCategory[]
  overallRating: number
  feedback: string
  createdAt: string
  updatedAt: string
}

export interface EvaluationFormData {
  internshipId: string
  categories: EvaluationCategory[]
  feedback: string
  overallRating: number
}

// In-memory data store
export const evaluations: Evaluation[] = [
  {
    id: "1",
    internshipId: "1",
    evaluatorId: "john_001",
    studentId: "alice_001",
    evaluationDate: "2025-02-15",
    dueDate: "2025-02-15",
    status: "submitted",
    categories: [
      { name: "Technical Skills", rating: 4.5, weight: 0.3, comments: "Strong coding ability" },
      { name: "Communication", rating: 4, weight: 0.2, comments: "Good team communication" },
      { name: "Problem Solving", rating: 4.5, weight: 0.25 },
      { name: "Team Work", rating: 5, weight: 0.15 },
      { name: "Reliability", rating: 4.5, weight: 0.1 },
    ],
    overallRating: 4.4,
    feedback: "Excellent work on the project. Great attention to detail and collaborative team member.",
    createdAt: "2025-02-15",
    updatedAt: "2025-02-15",
  },
]

export function getEvaluationsByInternship(internshipId: string): Evaluation[] {
  return evaluations.filter((e) => e.internshipId === internshipId)
}

export function getEvaluationById(id: string): Evaluation | undefined {
  return evaluations.find((e) => e.id === id)
}

export function createEvaluation(data: Omit<Evaluation, "id" | "createdAt" | "updatedAt">): Evaluation {
  const evaluation: Evaluation = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  evaluations.push(evaluation)
  return evaluation
}

export function updateEvaluation(id: string, data: Partial<Evaluation>): Evaluation | undefined {
  const index = evaluations.findIndex((e) => e.id === id)
  if (index === -1) return undefined
  evaluations[index] = { ...evaluations[index], ...data, updatedAt: new Date().toISOString() }
  return evaluations[index]
}

export function calculateWeightedRating(categories: EvaluationCategory[]): number {
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) return 0
  const weightedSum = categories.reduce((sum, c) => sum + c.rating * c.weight, 0)
  return Math.round((weightedSum / totalWeight) * 10) / 10
}
