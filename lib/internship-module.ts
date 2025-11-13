export interface Internship {
  id: string
  studentId: string
  companyId: string
  position: string
  department: string
  startDate: string
  endDate: string
  supervisorId: string
  status: "pending" | "active" | "completed" | "terminated"
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  industry: string
  website?: string
}

export interface InternshipFormData {
  position: string
  department: string
  company: string
  supervisor: string
  startDate: string
  endDate: string
  description: string
  requirements: string
}

// In-memory data store (replace with database in production)
export const internships: Internship[] = [
  {
    id: "1",
    studentId: "alice_001",
    companyId: "tech_corp",
    position: "Software Developer",
    department: "Engineering",
    startDate: "2025-01-15",
    endDate: "2025-04-15",
    supervisorId: "john_001",
    status: "active",
    description: "Develop and maintain web applications",
    responsibilities: ["Code development", "Testing", "Documentation"],
    createdAt: "2024-12-01",
    updatedAt: "2025-01-15",
  },
]

export function getInternshipsByStudent(studentId: string): Internship[] {
  return internships.filter((i) => i.studentId === studentId)
}

export function getInternshipById(id: string): Internship | undefined {
  return internships.find((i) => i.id === id)
}

export function createInternship(data: Omit<Internship, "id" | "createdAt" | "updatedAt">): Internship {
  const internship: Internship = {
    ...data,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  internships.push(internship)
  return internship
}

export function updateInternship(id: string, data: Partial<Internship>): Internship | undefined {
  const index = internships.findIndex((i) => i.id === id)
  if (index === -1) return undefined
  internships[index] = { ...internships[index], ...data, updatedAt: new Date().toISOString() }
  return internships[index]
}
