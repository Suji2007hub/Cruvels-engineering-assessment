import {
  Student,
  Teacher,
  ClassSection,
  AttendanceRecord,
  User,
  SystemStats,
  TestResultItem,
} from '../types.js';

const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Stats & Dashboard
  async getStats(): Promise<{ success: boolean; data: any }> {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },

  // Auth & Authentication
  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/current`, {
      credentials: 'include',
    });
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.json();
  },

  // Teachers
  async getTeachers(department?: string): Promise<{ success: boolean; data: Teacher[] }> {
    const url = department && department !== 'All' 
      ? `${API_BASE}/teachers?department=${encodeURIComponent(department)}`
      : `${API_BASE}/teachers`;
    const res = await fetch(url);
    return res.json();
  },

  async getTeacherById(id: string): Promise<{ success: boolean; data: Teacher & { assignedClassDetails?: ClassSection[] } }> {
    const res = await fetch(`${API_BASE}/teachers/${id}`);
    return res.json();
  },

  async createTeacher(teacher: Partial<Teacher>): Promise<{ success: boolean; data: Teacher }> {
    const res = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacher),
    });
    return res.json();
  },

  async updateTeacher(id: string, updates: Partial<Teacher>): Promise<{ success: boolean; data: Teacher }> {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTeacher(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/teachers/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Classes & Sections
  async getClasses(): Promise<{ success: boolean; data: ClassSection[] }> {
    const res = await fetch(`${API_BASE}/classes`);
    return res.json();
  },

  async getClassById(id: string): Promise<{
    success: boolean;
    data: ClassSection & { classTeacher?: Teacher; students: Student[] };
  }> {
    const res = await fetch(`${API_BASE}/classes/${id}`);
    return res.json();
  },

  async createClass(cls: Partial<ClassSection>): Promise<{ success: boolean; data: ClassSection }> {
    const res = await fetch(`${API_BASE}/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cls),
    });
    return res.json();
  },

  async updateClass(id: string, updates: Partial<ClassSection>): Promise<{ success: boolean; data: ClassSection }> {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteClass(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/classes/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Students
  async getStudents(filters?: {
    sectionId?: string;
    grade?: string;
    search?: string;
    status?: string;
  }): Promise<{ success: boolean; data: Student[] }> {
    const params = new URLSearchParams();
    if (filters?.sectionId) params.append('sectionId', filters.sectionId);
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    const res = await fetch(`${API_BASE}/students?${params.toString()}`);
    return res.json();
  },

  async getStudentById(id: string): Promise<{
    success: boolean;
    data: Student & { sectionDetails?: ClassSection; attendanceSummary: any };
  }> {
    const res = await fetch(`${API_BASE}/students/${id}`);
    return res.json();
  },

  async createStudent(student: Partial<Student>): Promise<{ success: boolean; data: Student }> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    return res.json();
  },

  async createStudentsBulk(students: Array<Partial<Student>>): Promise<{ success: boolean; count: number; data: Student[] }> {
    const res = await fetch(`${API_BASE}/students/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students }),
    });
    return res.json();
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; data: Student }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Attendance
  async getAttendance(sectionId: string, date: string): Promise<{
    success: boolean;
    data: {
      date: string;
      sectionId: string;
      isSubmitted: boolean;
      totalStudents: number;
      presentCount: number;
      lateCount: number;
      absentCount: number;
      excusedCount: number;
      attendanceRate: number;
      records: Array<{
        studentId: string;
        studentName: string;
        rollNumber: string;
        gender: string;
        status: 'Present' | 'Absent' | 'Late' | 'Excused';
        remarks: string;
        isRecorded: boolean;
      }>;
    };
  }> {
    const res = await fetch(`${API_BASE}/attendance?sectionId=${encodeURIComponent(sectionId)}&date=${encodeURIComponent(date)}`);
    return res.json();
  },

  async saveAttendance(payload: {
    date: string;
    sectionId: string;
    records: Array<{ studentId: string; status: string; remarks?: string }>;
    recordedBy?: string;
  }): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getStudentAttendanceSummary(studentId: string) {
    const res = await fetch(`${API_BASE}/attendance/student/${studentId}`);
    return res.json();
  },

  // System & Tests
  async resetDatabase() {
    const res = await fetch(`${API_BASE}/system/reset`, { method: 'POST' });
    return res.json();
  },

  async exportDatabase() {
    const res = await fetch(`${API_BASE}/system/export`);
    return res.json();
  },

  async runTests(): Promise<{
    success: boolean;
    total: number;
    passed: number;
    failed: number;
    timestamp: string;
    results: TestResultItem[];
  }> {
    const res = await fetch(`${API_BASE}/tests/run`, { method: 'POST' });
    return res.json();
  },
};