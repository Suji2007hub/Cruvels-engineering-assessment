import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';

// Type definitions for the new schema
export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
}

export interface Teacher {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  subject?: string;
  is_active: number;
}

export interface Class {
  id: number;
  grade: string;
  section: string;
  teacher_id?: number;
}

export interface Student {
  id: number;
  user_id?: number;
  name: string;
  roll_number: string;
  class_id: number;
  guardian_name?: string;
  guardian_phone?: string;
  is_active: number;
}

export interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late';
  marked_by: number;
  updated_at: string;
}

export class SchoolDatabase {
  private db: Database.Database;

  constructor() {
    // Open SQLite database (creates file if it doesn't exist)
    this.db = new Database('school.db');
    this.initDatabase();
  }

  private initDatabase() {
    // Enable foreign keys
    this.db.exec('PRAGMA foreign_keys = ON');
    
    // Create tables if they don't exist
    this.createTables();
    
    // Check if database is empty, if so seed it
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count === 0) {
      this.seedDatabase();
    }
  }

  private createTables() {
    // Users table for authentication - holds login credentials for ALL roles
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role          TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Teachers table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teachers (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name         TEXT NOT NULL,
        phone        TEXT,
        subject      TEXT,
        is_active    INTEGER NOT NULL DEFAULT 1
      );
    `);

    // Classes table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        grade        TEXT NOT NULL,          -- e.g. "10"
        section      TEXT NOT NULL,          -- e.g. "A"
        teacher_id   INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
        UNIQUE(grade, section)
      );
    `);

    // Students table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS students (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL, -- nullable: student login is optional
        name          TEXT NOT NULL,
        roll_number   TEXT NOT NULL,
        class_id      INTEGER NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
        guardian_name TEXT,
        guardian_phone TEXT,
        is_active     INTEGER NOT NULL DEFAULT 1,
        UNIQUE(class_id, roll_number)
      );
    `);

    // Attendance records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        class_id     INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        date         TEXT NOT NULL,          -- 'YYYY-MM-DD'
        status       TEXT NOT NULL CHECK (status IN ('present','absent','late')),
        marked_by    INTEGER NOT NULL REFERENCES teachers(id),
        updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(student_id, date)             -- one record per student per day; "correction" = UPDATE not INSERT
      );
    `);
  }

  private async seedDatabase() {
    // Hash default passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const teacherPassword = await bcrypt.hash('Teacher@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    // Insert admin user
    const adminUserResult = this.db.prepare(`
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `).run('admin@school.test', adminPassword, 'admin');
    const adminId = adminUserResult.lastInsertRowid as number;

    // Insert admin teacher record (for ownership of classes)
    const adminTeacherResult = this.db.prepare(`
      INSERT INTO teachers (user_id, name, phone, subject, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'Principal Admin', '+1 (555) 000-0000', 'Administration', 1);
    const adminTeacherId = adminTeacherResult.lastInsertRowid as number;

    // Insert teacher1@school.test
    const teacher1UserResult = this.db.prepare(`
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `).run('teacher1@school.test', teacherPassword, 'teacher');
    const teacher1Id = teacher1UserResult.lastInsertRowid as number;

    // Insert teacher record
    const teacher1Result = this.db.prepare(`
      INSERT INTO teachers (user_id, name, phone, subject, is_active)
      VALUES (?, ?, ?, ?, ?)
    `).run(teacher1Id, 'Sarah Jenkins', '+1 (555) 345-6782', 'Mathematics', 1);
    const teacherDb1Id = teacher1Result.lastInsertRowid as number;

    // Insert student1@school.test
    const student1UserResult = this.db.prepare(`
      INSERT INTO users (email, password_hash, role)
      VALUES (?, ?, ?)
    `).run('student1@school.test', studentPassword, 'student');
    const student1Id = student1UserResult.lastInsertRowid as number;

    // Create sample classes
    const class10AResult = this.db.prepare(`
      INSERT INTO classes (grade, section, teacher_id)
      VALUES (?, ?, ?)
    `).run('10', 'A', teacherDb1Id);
    const class10AId = class10AResult.lastInsertRowid as number;

    const class9AResult = this.db.prepare(`
      INSERT INTO classes (grade, section, teacher_id)
      VALUES (?, ?, ?)
    `).run('9', 'A', teacherDb1Id);
    const class9AId = class9AResult.lastInsertRowid as number;

    // Insert student record
    this.db.prepare(`
      INSERT INTO students (user_id, name, roll_number, class_id, guardian_name, guardian_phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(student1Id, 'Aditi Rao', '10A-04', class10AId, 'Rao Family', '+1 (555) 123-4567', 1);
  }

  // --- User methods ---
  public getUserById(id: number): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as User;
  }

  public getUserByEmail(email: string): User | null {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!row) return null;
    return row as User;
  }

  // --- Teacher methods ---
  public getAllTeachers(): Teacher[] {
    const rows = this.db.prepare('SELECT * FROM teachers').all() as any[];
    return rows as Teacher[];
  }

  public getTeacherById(id: number): Teacher | null {
    const row = this.db.prepare('SELECT * FROM teachers WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as Teacher;
  }

  public getTeacherByUserId(userId: number): Teacher | null {
    const row = this.db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(userId) as any;
    if (!row) return null;
    return row as Teacher;
  }

  public getClassesForTeacher(teacherId: number): Class[] {
    const rows = this.db.prepare('SELECT * FROM classes WHERE teacher_id = ?').all(teacherId) as any[];
    return rows as Class[];
  }

  // --- Class methods ---
  public getAllClasses(): Class[] {
    const rows = this.db.prepare('SELECT * FROM classes').all() as any[];
    return rows as Class[];
  }

  public getClassById(id: number): Class | null {
    const row = this.db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as Class;
  }

  public createClass(grade: string, section: string, teacherId?: number): Class {
    const result = this.db.prepare(`
      INSERT INTO classes (grade, section, teacher_id)
      VALUES (?, ?, ?)
    `).run(grade, section, teacherId || null);
    
    return this.getClassById(result.lastInsertRowid as number)!;
  }

  // --- Student methods ---
  public getAllStudents(classId?: number): Student[] {
    let query = 'SELECT * FROM students';
    const params: any[] = [];
    
    if (classId) {
      query += ' WHERE class_id = ?';
      params.push(classId);
    }
    
    const rows = this.db.prepare(query).all(...params) as any[];
    return rows as Student[];
  }

  public getStudentById(id: number): Student | null {
    const row = this.db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
    if (!row) return null;
    return row as Student;
  }

  public getStudentsForClass(classId: number): Student[] {
    return this.getAllStudents(classId);
  }

  public createStudent(name: string, rollNumber: string, classId: number, guardianName?: string, guardianPhone?: string, userId?: number): Student {
    const result = this.db.prepare(`
      INSERT INTO students (user_id, name, roll_number, class_id, guardian_name, guardian_phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId || null, name, rollNumber, classId, guardianName || null, guardianPhone || null);
    
    return this.getStudentById(result.lastInsertRowid as number)!;
  }

  public updateStudent(id: number, data: Partial<Student>): Student {
    const student = this.getStudentById(id);
    if (!student) throw new Error('Student not found');

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (data.name) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }
    if (data.roll_number) {
      updateFields.push('roll_number = ?');
      updateValues.push(data.roll_number);
    }
    if (data.class_id) {
      updateFields.push('class_id = ?');
      updateValues.push(data.class_id);
    }
    if (data.guardian_name) {
      updateFields.push('guardian_name = ?');
      updateValues.push(data.guardian_name);
    }
    if (data.guardian_phone) {
      updateFields.push('guardian_phone = ?');
      updateValues.push(data.guardian_phone);
    }
    if (data.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(data.is_active);
    }
    
    if (updateFields.length > 0) {
      this.db.prepare(`
        UPDATE students SET ${updateFields.join(', ')} WHERE id = ?
      `).run(...updateValues, id);
    }
    
    return this.getStudentById(id)!;
  }

  public deleteStudent(id: number): boolean {
    const result = this.db.prepare('DELETE FROM students WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // --- Attendance methods ---
  public getAttendanceForDateAndClass(date: string, classId: number): Attendance[] {
    const rows = this.db.prepare('SELECT * FROM attendance WHERE date = ? AND class_id = ?').all(date, classId) as any[];
    return rows as Attendance[];
  }

  public createOrUpdateAttendance(studentId: number, classId: number, date: string, status: 'present' | 'absent' | 'late', markedBy: number): Attendance {
    // Check if record exists
    const existing = this.db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date = ?').get(studentId, date) as any;
    
    if (existing) {
      // Update existing record
      this.db.prepare(`
        UPDATE attendance SET status = ?, marked_by = ?, updated_at = datetime('now')
        WHERE student_id = ? AND date = ?
      `).run(status, markedBy, studentId, date);
    } else {
      // Create new record
      this.db.prepare(`
        INSERT INTO attendance (student_id, class_id, date, status, marked_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(studentId, classId, date, status, markedBy);
    }
    
    return this.db.prepare('SELECT * FROM attendance WHERE student_id = ? AND date = ?').get(studentId, date) as Attendance;
  }

  public getStudentAttendanceHistory(studentId: number): Attendance[] {
    const rows = this.db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC').all(studentId) as any[];
    return rows as Attendance[];
  }

  // --- Dashboard stats ---
  public getSystemStats(userId?: number, userRole?: string): any {
    const studentCount = this.db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const teacherCount = this.db.prepare('SELECT COUNT(*) as count FROM teachers').get() as { count: number };
    const classCount = this.db.prepare('SELECT COUNT(*) as count FROM classes').get() as { count: number };
    
    // Today's attendance rate
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = this.db.prepare('SELECT * FROM attendance WHERE date = ?').all(today) as Attendance[];
    const presentCount = todayAttendance.filter(a => a.status === 'present').length;
    const attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;

    return {
      totalStudents: studentCount.count,
      totalTeachers: teacherCount.count,
      totalClasses: classCount.count,
      todayAttendanceRate: attendanceRate
    };
  }

  // Close database connection
  public close() {
    this.db.close();
  }
}

export const db = new SchoolDatabase();