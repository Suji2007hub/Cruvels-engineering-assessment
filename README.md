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

---

## System Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   React Client   │────▶│   Express API    │────▶│   SQLite DB      │
│  (Frontend SPA)  │     │   (Backend)      │     │  (Persistence)   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Auth Middleware │
                       │  Role Guards     │
                       └──────────────────┘
```

**Architecture Flow**:
1. Client-side React app serves the user interface
2. All API requests pass through authentication middleware
3. Role-based guards restrict access to authorized endpoints only
4. SQLite database provides persistent storage for all entities
5. JWT tokens in HTTP-only cookies maintain secure sessions

---

## Entity Relationship (ER) Diagram

```
┌─────────────────┐        ┌─────────────────┐
│      Users      │        │     Teachers    │
├─────────────────┤        ├─────────────────┤
│ id              │        │ id              │
│ email           │        │ user_id         │◄──┐
│ password_hash   │        │ name            │   │
│ role            │        │ department      │   │
└─────────────────┘        │ subject        │   │
        │                   └─────────────────┘   │
        │                                          │
        │           ┌─────────────────┐           │
        │           │    ClassSections │           │
        │           ├─────────────────┤           │
        │           │ id              │           │
        │           │ name            │           │
        │           │ teacher_id      │───────────┘
        │           │ room_number     │
        │           └─────────────────┘
        │                   │
        │                   │
        │           ┌─────────────────┐
        │           │    Students     │
        │           ├─────────────────┤
        └──────────▶│ user_id         │
                    │ id              │
                    │ name            │
                    │ section_id      │───────────┐
                    │ roll_number     │           │
                    └─────────────────┘           │
                                                    │
                                                    │
                                            ┌─────────────────┐
                                            │   Attendance    │
                                            ├─────────────────┤
                                            │ id              │
                                            │ student_id      │◄──┘
                                            │ section_id      │
                                            │ date            │
                                            │ status          │
                                            └─────────────────┘
```

### Core Entities:
- **Users**: System accounts with authentication credentials and roles
- **Teachers**: Teacher profiles linked to user accounts
- **Students**: Student profiles linked to user accounts and class sections
- **ClassSections**: Academic sections with assigned teachers
- **Attendance**: Daily attendance records for students in sections

---

## API Endpoint Documentation

### Public Endpoints
| Method | Endpoint               | Description                                  | Auth Required |
|--------|------------------------|----------------------------------------------|---------------|
| GET    | `/api/health`          | Server health check                          | No            |
| POST   | `/api/auth/login`      | Authenticate user and set session cookie     | No            |
| POST   | `/api/auth/logout`     | Clear session and log out user               | No            |

### Protected Endpoints (Require Authentication)
| Method | Endpoint               | Description                                  | Allowed Roles |
|--------|------------------------|----------------------------------------------|---------------|
| GET    | `/api/auth/current`    | Get currently authenticated user             | All           |
| GET    | `/api/stats`           | Get system statistics and dashboard data     | All           |
| GET    | `/api/students`        | Get all students                             | Admin, Teacher|
| POST   | `/api/students`        | Create new student                           | Admin         |
| PUT    | `/api/students/:id`    | Update student information                    | Admin         |
| DELETE | `/api/students/:id`    | Delete student                               | Admin         |
| GET    | `/api/teachers`        | Get all teachers                             | Admin, Teacher|
| POST   | `/api/teachers`        | Create new teacher                           | Admin         |
| PUT    | `/api/teachers/:id`    | Update teacher information                    | Admin         |
| DELETE | `/api/teachers/:id`    | Delete teacher                               | Admin         |
| GET    | `/api/classes`         | Get all class sections                       | Admin, Teacher|
| POST   | `/api/classes`         | Create new class section                     | Admin         |
| PUT    | `/api/classes/:id`     | Update class section                         | Admin         |
| DELETE | `/api/classes/:id`     | Delete class section                         | Admin         |
| GET    | `/api/attendance`      | Get attendance records for a section/date    | Admin, Teacher|
| POST   | `/api/attendance`      | Save attendance records                       | Admin, Teacher|
| GET    | `/api/reports`         | Generate system reports                      | Admin         |

---

## Role Permissions Matrix

| Feature                          | Admin (Principal) | Teacher | Student |
|----------------------------------|-------------------|---------|---------|
| View all students                | ✅                | ✅      | ❌      |
| Add/edit/delete students         | ✅                | ❌      | ❌      |
| View all teachers                | ✅                | ✅      | ❌      |
| Add/edit/delete teachers         | ✅                | ❌      | ❌      |
| Manage class sections            | ✅                | ❌      | ❌      |
| Mark attendance for sections     | ✅                | ✅      | ❌      |
| View own attendance records      | ✅                | ✅      | ✅      |
| View all reports and analytics   | ✅                | ❌      | ❌      |
| Access teacher portal            | ✅                | ✅      | ❌      |
| Access student portal            | ✅                | ✅      | ✅      |
| Modify system settings           | ✅                | ❌      | ❌      |

---

## Testing

This project includes a comprehensive test suite built with Vitest. The tests cover authentication, authorization, and core API functionality.

### Running Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Test Coverage
Current tests include:
1. Health check endpoint validation
2. Authentication middleware protecting routes
3. Successful login with valid credentials
4. Failed login with incorrect passwords
5. Role-based access control enforcement
6. Admin access to protected dashboard endpoints

---

## Known Limitations

1. **No password reset functionality**: Users cannot reset forgotten passwords; this must be done manually by an admin
2. **Single school only**: The system is designed for one school; no multi-tenancy support
3. **Limited reporting**: Basic statistics only, no advanced filtering or custom report builder
4. **File upload restrictions**: No support for uploading student documents, photos, or bulk CSV imports beyond basic functionality
5. **Email notifications**: No automated email system for attendance alerts or announcements
6. **Mobile responsiveness**: UI works best on desktop; mobile layout needs improvements
7. **No data backup**: Automatic database backup not implemented; users must manually backup the SQLite file

---

## Future Improvements

### Short-term
- [ ] Add password reset workflow with email verification
- [ ] Improve mobile responsiveness across all views
- [ ] Implement CSV bulk import for students and teachers
- [ ] Add more test cases for all API endpoints
- [ ] Create automated backup schedule for the database

### Long-term
- [ ] Add email notification system for attendance alerts
- [ ] Implement gradebook and academic performance tracking
- [ ] Add parent portal with limited access to child's information
- [ ] Support calendar integration for events and holidays
- [ ] Implement payment processing for tuition fees
- [ ] Add document upload and management system
- [ ] Create advanced reporting with export to PDF/Excel
- [ ] Multi-language support for international schools