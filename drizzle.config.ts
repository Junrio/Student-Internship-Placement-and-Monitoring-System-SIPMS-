import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"
import { resolve } from "path"

// Load .env.local file from the project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") })

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env.local file")
}

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config

