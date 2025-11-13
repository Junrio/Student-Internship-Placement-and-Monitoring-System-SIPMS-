# Student Internship Placement and Monitoring System (SIPMS)

A comprehensive web application built with Next.js for managing student internships, placements, evaluations, and monitoring.

## Features

### Role-Based Access Control
- **Administrator**: Manage users, system settings, view analytics, audit logs
- **Coordinator**: Manage students, assign placements, track progress, generate reports
- **Supervisor**: Evaluate interns, verify attendance, provide feedback
- **Student**: Submit logs, track progress, view evaluations, manage profile

### Key Functionalities
- User management and authentication
- Internship placement management
- Student progress tracking
- Attendance monitoring
- Evaluation system with ratings and feedback
- Real-time analytics and reporting
- Audit logging
- Messaging system
- Notification system

## Tech Stack

- **Framework**: Next.js 16.0.0
- **Language**: TypeScript
- **Database**: PostgreSQL (with Drizzle ORM)
- **UI Components**: Custom UI components with Tailwind CSS
- **Authentication**: Cookie-based session management

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Junrio/Student-Internship-Placement-and-Monitoring-System-SIPMS-.git
cd Student-Internship-Placement-and-Monitoring-System-SIPMS-
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your database connection string:
```
DATABASE_URL=your_postgresql_connection_string
```

4. Run database migrations:
```bash
npm run db:push
# or
npx drizzle-kit push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sipms/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages for each role
│   ├── auth/              # Authentication pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── db/                    # Database configuration and queries
│   ├── schema.ts         # Drizzle schema definitions
│   └── queries/          # Database query functions
├── lib/                   # Utility functions and modules
└── ...
```

## Database Schema

The system uses PostgreSQL with the following main entities:
- Users (students, coordinators, supervisors, admins)
- Companies
- Internships
- Evaluations
- Attendance records
- Messages
- Notifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Contact

For questions or support, please open an issue on GitHub.
