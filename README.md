# EduCore School Management System

A simple, self-contained school administration platform for managing students, teachers, classes, and attendance.

---

## Project Overview

EduCore is a minimum viable product (MVP) that provides core school management functionality. It's built to be easy to set up and run locally, with persistent storage and secure authentication.

## Key Features

### Admin Dashboard
- Real-time counts of enrolled students, faculty, and active classes
- Today's school-wide attendance percentage
- Breakdown of present, late, absent, and excused students
- Activity log tracking all system changes

### Student Management
- View and search all students
- Add individual students or bulk create multiple students
- Track student details including contact information, guardians, and enrollment dates
- Update student status (active/inactive)

### Teacher & Class Management
- Directory of all faculty members with their assigned subjects
- Manage class sections and their assigned teachers
- Track classroom locations and capacities

### Attendance Tracking
- Mark daily attendance for any class section
- Track attendance status (present, absent, late, excused)
- View individual student attendance history
- Calculate overall attendance rates

### Student Portal
- Students can view their own attendance records
- Access their personal information and class schedule
- Secure login with unique credentials

## Technology Stack

- **Frontend**: React 19 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (file-based, zero external setup required)
- **Authentication**: JWT with HTTP-only cookies and bcrypt password hashing
- **Bundler**: Vite + esbuild

---

## Local Setup & Run Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation
1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Update the JWT_SECRET in `.env` to a secure random string for production use.

### Run the application
For development:
```bash
npm run dev
```

For production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

### Default Login Credentials
| Role     | Email               | Password   |
|----------|---------------------|------------|
| Admin    | admin@educore.local | admin123   |
| Teacher  | teacher@educore.local | teacher123 |
| Student  | student@educore.local | student123 |

---

## Database
The application uses SQLite for persistent storage, which creates a single `educore.db` file in the project root. This file contains all your data, so it's easy to backup and transfer.

## Security
- Passwords are hashed with bcrypt before storage
- JWT tokens are stored in HTTP-only cookies to prevent XSS attacks
- Role-based access control ensures users can only access appropriate features