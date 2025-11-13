import { eq } from "drizzle-orm"
import { db } from "../index"
import { companies, type Company, type NewCompany } from "../schema"

export async function getCompanyById(id: number): Promise<Company | null> {
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1)
  return result[0] || null
}

export async function getCompanyByCompanyId(companyId: string): Promise<Company | null> {
  const result = await db.select().from(companies).where(eq(companies.companyId, companyId)).limit(1)
  return result[0] || null
}

export async function getAllCompanies(): Promise<Company[]> {
  return await db.select().from(companies)
}

export async function createCompany(companyData: NewCompany): Promise<Company> {
  const result = await db.insert(companies).values(companyData).returning()
  return result[0]
}

export async function updateCompany(id: number, companyData: Partial<NewCompany>): Promise<Company | null> {
  const result = await db
    .update(companies)
    .set({ ...companyData, updatedAt: new Date() })
    .where(eq(companies.id, id))
    .returning()
  return result[0] || null
}






