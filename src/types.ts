export type UserRole = 'admin' | 'teacher' | 'student';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'attendance'
  | 'teacher-portal'
  | 'student-portal'
  | 'reports';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  teacherId?: number;
  studentId?: number;
}

export interface Teacher {
  id: number;
  user_id: number;
  name: string;
  phone?: string;
  subject?: string;
  is_active: number;
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

export interface SchedulePeriod {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period: number;
  time: string;
  subject: string;
  teacherId?: string;
}

export interface Class {
  id: number;
  grade: string;
  section: string;
  teacher_id?: number;
}

export interface ClassSection extends Class {
  name?: string; // For frontend display
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_by: number;
  updated_at: string;
}

export interface AttendanceSession {
  date: string;
  sectionId: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
  isSubmitted: boolean;
  submittedBy?: string;
  submittedAt?: string;
}

export interface StudentAttendanceSummary {
  studentId: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  category: 'student' | 'teacher' | 'class' | 'attendance' | 'auth' | 'system';
}

export interface SystemStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClassesToday: number;
  overallAttendanceRate: number;
  todayAttendanceSummary: {
    totalEnrolled: number;
    marked: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
  gradeBreakdown: { grade: string; studentCount: number; attendanceRate: number }[];
  recentActivities: ActivityLog[];
  criticalAttendanceCount: number; // students < 75%
}

export interface TestResultItem {
  id: string;
  name: string;
  module: string;
  status: 'passed' | 'failed' | 'pending';
  durationMs: number;
  details?: string;
  error?: string;
}