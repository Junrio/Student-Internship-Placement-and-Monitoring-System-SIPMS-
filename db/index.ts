import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

let client: postgres.Sql | null = null
let dbInstance: ReturnType<typeof drizzle> | null = null

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set")
  }
  
  if (!client) {
    // Disable prefetch as it is not supported for "Transaction" pool mode
    client = postgres(process.env.DATABASE_URL, { prepare: false })
  }
  
  return client
}

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getClient(), { schema })
  }
  
  return dbInstance
}

// Export a getter that initializes on first use (lazy initialization)
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>]
  }
})








