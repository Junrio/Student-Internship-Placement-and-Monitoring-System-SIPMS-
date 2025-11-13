CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'leave', 'holiday');--> statement-breakpoint
CREATE TYPE "public"."evaluation_status" AS ENUM('draft', 'submitted', 'reviewed');--> statement-breakpoint
CREATE TYPE "public"."internship_status" AS ENUM('pending', 'active', 'completed', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'coordinator', 'supervisor', 'admin');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" varchar(50) NOT NULL,
	"internship_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"status" "attendance_status" NOT NULL,
	"check_in_time" varchar(10),
	"check_out_time" varchar(10),
	"notes" text,
	"marked_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "attendance_records_record_id_unique" UNIQUE("record_id")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"industry" varchar(100) NOT NULL,
	"website" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"evaluation_id" varchar(50) NOT NULL,
	"internship_id" integer NOT NULL,
	"evaluator_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"evaluation_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" "evaluation_status" DEFAULT 'draft' NOT NULL,
	"categories" jsonb NOT NULL,
	"overall_rating" integer NOT NULL,
	"feedback" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "evaluations_evaluation_id_unique" UNIQUE("evaluation_id")
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" serial PRIMARY KEY NOT NULL,
	"internship_id" varchar(50) NOT NULL,
	"student_id" integer NOT NULL,
	"company_id" integer NOT NULL,
	"position" varchar(255) NOT NULL,
	"department" varchar(100) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"supervisor_id" integer NOT NULL,
	"status" "internship_status" DEFAULT 'pending' NOT NULL,
	"description" text,
	"responsibilities" jsonb,
	"requirements" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "internships_internship_id_unique" UNIQUE("internship_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" varchar(50) NOT NULL,
	"sender_id" integer NOT NULL,
	"sender_name" varchar(255) NOT NULL,
	"recipient_id" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "messages_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"phone" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_users_id_fk" FOREIGN KEY ("evaluator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_supervisor_id_users_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;