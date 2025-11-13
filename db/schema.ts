import { pgTable, text, timestamp, varchar, integer, boolean, jsonb, pgEnum, serial } from "drizzle-orm/pg-core"

// Enums
export const userRoleEnum = pgEnum("user_role", ["student", "coordinator", "supervisor", "admin"])
export const internshipStatusEnum = pgEnum("internship_status", ["pending", "active", "completed", "terminated"])
export const evaluationStatusEnum = pgEnum("evaluation_status", ["draft", "submitted", "reviewed"])
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "leave", "holiday"])

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  industry: varchar("industry", { length: 100 }).notNull(),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Internships table
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  internshipId: varchar("internship_id", { length: 50 }).notNull().unique(),
  studentId: integer("student_id").notNull().references(() => users.id),
  companyId: integer("company_id").notNull().references(() => companies.id),
  position: varchar("position", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  supervisorId: integer("supervisor_id").notNull().references(() => users.id),
  status: internshipStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  responsibilities: jsonb("responsibilities").$type<string[]>(),
  requirements: jsonb("requirements").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Evaluations table
export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  evaluationId: varchar("evaluation_id", { length: 50 }).notNull().unique(),
  internshipId: integer("internship_id").notNull().references(() => internships.id),
  evaluatorId: integer("evaluator_id").notNull().references(() => users.id),
  studentId: integer("student_id").notNull().references(() => users.id),
  evaluationDate: timestamp("evaluation_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: evaluationStatusEnum("status").notNull().default("draft"),
  categories: jsonb("categories").$type<Array<{
    name: string
    rating: number
    weight: number
    comments?: string
  }>>().notNull(),
  overallRating: integer("overall_rating").notNull(),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  recordId: varchar("record_id", { length: 50 }).notNull().unique(),
  internshipId: integer("internship_id").notNull().references(() => internships.id),
  date: timestamp("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  checkInTime: varchar("check_in_time", { length: 10 }),
  checkOutTime: varchar("check_out_time", { length: 10 }),
  notes: text("notes"),
  markedBy: integer("marked_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  messageId: varchar("message_id", { length: 50 }).notNull().unique(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  attachments: jsonb("attachments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Type exports for TypeScript
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Company = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert
export type Internship = typeof internships.$inferSelect
export type NewInternship = typeof internships.$inferInsert
export type Evaluation = typeof evaluations.$inferSelect
export type NewEvaluation = typeof evaluations.$inferInsert
export type AttendanceRecord = typeof attendanceRecords.$inferSelect
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert







