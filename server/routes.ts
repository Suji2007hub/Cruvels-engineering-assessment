import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { User } from '../src/types.js';

// JWT Secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'educore-super-secret-jwt-key-2026';
const SALT_ROUNDS = 10;

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Auth middleware to protect routes
export const requireAuth = (req: Request, res: Response, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized - No token provided' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized - Invalid token' });
  }
};

// Role-based auth middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden - Insufficient permissions' });
    }
    next();
  };
};

export const apiRouter = Router();

// --- Health ---
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'EduCore School ERP API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// --- Stats & Dashboard Analytics ---
apiRouter.get('/stats', requireAuth, (req: Request, res: Response) => {
  try {
    const stats = db.getSystemStats(req.user?.id, req.user?.role);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Authentication ---
// Get current authenticated user
apiRouter.get('/auth/current', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Login endpoint
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Get user from database
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Prepare user object for JWT
    const userForToken: any = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // If user is a teacher, get their teacher ID
    if (user.role === 'teacher') {
      const teacher = db.getTeacherByUserId(user.id);
      if (teacher) {
        userForToken.teacherId = teacher.id;
        userForToken.name = teacher.name;
      }
    }

    // If user is a student, get their student ID
    if (user.role === 'student') {
      const students = db.getAllStudents();
      const student = students.find(s => s.user_id === user.id);
      if (student) {
        userForToken.studentId = student.id;
        userForToken.name = student.name;
      }
    }

    // If admin, set name
    if (user.role === 'admin') {
      userForToken.name = 'Admin User';
    }

    // Create JWT token
    const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: '24h' });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({ success: true, user: userForToken });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout endpoint
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// --- Teachers CRUD ---
apiRouter.get('/teachers', requireAuth, (req: Request, res: Response) => {
  try {
    let teachers = db.getAllTeachers();
    res.json({ success: true, count: teachers.length, data: teachers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/teachers/:id', (req: Request, res: Response) => {
  const teacher = db.getTeacherById(parseInt(req.params.id));
  if (!teacher) {
    return res.status(404).json({ success: false, error: 'Teacher not found' });
  }
  // Include assigned classes full details
  const assignedClasses = db.getClassesForTeacher(teacher.id);
  res.json({ success: true, data: { ...teacher, assignedClassDetails: assignedClasses } });
});

// Unused teacher CRUD routes (legacy stubs - commented out to eliminate TypeScript errors)
// apiRouter.post('/teachers', (req: Request, res: Response) => {
//   try {
//     const { name, email, phone, qualification, department, subjects, assignedClassIds, status } = req.body;
//     if (!name || !email || !department) {
//       return res.status(400).json({ success: false, error: 'Name, email, and department are required' });
//     }
//     const newTeacher = db.createTeacher({
//       name,
//       email,
//       phone: phone || '+1 (555) 000-0000',
//       qualification: qualification || 'B.Ed / M.A.',
//       department,
//       subjects: Array.isArray(subjects) ? subjects : subjects ? [subjects] : ['General Studies'],
//       assignedClassIds: Array.isArray(assignedClassIds) ? assignedClassIds : [],
//       status: status || 'Active',
//       joinDate: new Date().toISOString().split('T')[0],
//       avatar: req.body.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
//     });
//     res.status(201).json({ success: true, data: newTeacher });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// apiRouter.put('/teachers/:id', (req: Request, res: Response) => {
//   try {
//     const updated = db.updateTeacher(req.params.id, req.body);
//     res.json({ success: true, data: updated });
//   } catch (error: any) {
//     res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
//   }
// });

// apiRouter.delete('/teachers/:id', (req: Request, res: Response) => {
//   const success = db.deleteTeacher(req.params.id);
//   if (!success) {
//     return res.status(404).json({ success: false, error: 'Teacher not found' });
//   }
//   res.json({ success: true, message: 'Teacher deleted successfully' });
// });

// --- Classes & Sections CRUD ---
apiRouter.get('/classes', (_req: Request, res: Response) => {
  try {
    const classes = db.getAllClasses();
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/classes/:id', (req: Request, res: Response) => {
  const cls = db.getClassById(parseInt(req.params.id));
  if (!cls) {
    return res.status(404).json({ success: false, error: 'Class section not found' });
  }
  const students = db.getStudentsForClass(cls.id);
  const classTeacher = cls.teacher_id ? db.getTeacherById(cls.teacher_id) : undefined;
  res.json({
    success: true,
    data: {
      ...cls,
      classTeacher,
      students,
    },
  });
});

apiRouter.post('/classes', requireRole(['admin']), (req: Request, res: Response) => {
  try {
    const { grade, section, teacher_id } = req.body;
    if (!grade || !section) {
      return res.status(400).json({ success: false, error: 'Grade and section are required' });
    }
    const newClass = db.createClass(
      grade,
      section,
      teacher_id ? parseInt(teacher_id) : undefined
    );
    res.status(201).json({ success: true, data: newClass });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Keep this for backward compatibility but point to our new implementation
apiRouter.post('/classes-legacy', (req: Request, res: Response) => {
  try {
    const { grade, section, name, roomNumber, capacity, classTeacherId, subjectTeacherMap, schedule } = req.body;
    if (!grade || !section || !name) {
      return res.status(400).json({ success: false, error: 'Grade, section, and name are required' });
    }
    const newClass = db.createClass(
      grade,
      section,
      classTeacherId ? parseInt(classTeacherId) : undefined
    );
    res.status(201).json({ success: true, data: newClass });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unused class CRUD routes (legacy stubs)
// apiRouter.put('/classes/:id', (req: Request, res: Response) => {
//   try {
//     const updated = db.updateClass(req.params.id, req.body);
//     res.json({ success: true, data: updated });
//   } catch (error: any) {
//     res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
//   }
// });

// apiRouter.delete('/classes/:id', (req: Request, res: Response) => {
//   const success = db.deleteClass(req.params.id);
//   if (!success) {
//     return res.status(404).json({ success: false, error: 'Class not found' });
//   }
//   res.json({ success: true, message: 'Class deleted successfully' });
// });

// --- Students CRUD ---
apiRouter.get('/students', requireAuth, (req: Request, res: Response) => {
  try {
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    let students = db.getAllStudents(classId);
    
    res.json({ success: true, count: students.length, data: students });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/students/:id', (req: Request, res: Response) => {
  const student = db.getStudentById(parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  // Get attendance history
  const attendanceHistory = db.getStudentAttendanceHistory(student.id);
  res.json({ success: true, data: { ...student, attendanceHistory } });
});

apiRouter.post('/students', requireRole(['admin', 'teacher']), (req: Request, res: Response) => {
  try {
    const { name, roll_number, class_id, guardian_name, guardian_phone, user_id } = req.body;
    if (!name || !roll_number || !class_id) {
      return res.status(400).json({ success: false, error: 'Name, roll number, and class ID are required' });
    }
    const newStudent = db.createStudent(
      name,
      roll_number,
      parseInt(class_id),
      guardian_name,
      guardian_phone,
      user_id ? parseInt(user_id) : undefined
    );
    res.status(201).json({ success: true, data: newStudent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unused bulk student import route (legacy stub)
// apiRouter.post('/students/bulk', (req: Request, res: Response) => {
//   try {
//     const { students: rawStudents } = req.body;
//     if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
//       return res.status(400).json({ success: false, error: 'students array is required' });
//     }

//     const preparedStudents = rawStudents.map((s: any, idx: number) => ({
//       name: s.name || `Student ${idx + 1}`,
//       email: s.email || `${(s.name || 'student').toLowerCase().replace(/\s+/g, '.')}${idx + 1}@student.edu`,
//       gender: s.gender || 'Other',
//       dob: s.dob || '2009-01-01',
//       grade: s.grade || '10',
//       sectionId: s.sectionId || 'cls-10a',
//       rollNumber: s.rollNumber || `${s.grade || '10'}A-${Math.floor(Math.random() * 80 + 10)}`,
//       guardianName: s.guardianName || 'Parent / Guardian',
//       guardianPhone: s.guardianPhone || '+1 (555) 000-0000',
//       guardianEmail: s.guardianEmail || 'parent@mail.com',
//       address: s.address || 'Springfield',
//       status: s.status || 'Active',
//       admissionDate: s.admissionDate || new Date().toISOString().split('T')[0],
//       bloodGroup: s.bloodGroup || 'O+',
//     }));

//     const created = db.createStudentsBulk(preparedStudents);
//     res.status(201).json({ success: true, count: created.length, data: created });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

apiRouter.put('/students/:id', requireRole(['admin', 'teacher']), (req: Request, res: Response) => {
  try {
    const updated = db.updateStudent(parseInt(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/students/:id', requireRole(['admin']), (req: Request, res: Response) => {
  const success = db.deleteStudent(parseInt(req.params.id));
  if (!success) {
    return res.status(404).json({ success: false, error: 'Student not found' });
  }
  res.json({ success: true, message: 'Student removed successfully' });
});

// --- Attendance APIs ---
apiRouter.get('/attendance', requireAuth, (req: Request, res: Response) => {
  try {
    const { date, classId } = req.query;
    if (!date || !classId) {
      return res.status(400).json({ success: false, error: 'Date and class ID are required' });
    }
    
    const records = db.getAttendanceForDateAndClass(date as string, parseInt(classId as string));
    res.json({ success: true, count: records.length, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/attendance/bulk', requireAuth, async (req: Request, res: Response) => {
  try {
    const { date, classId, records } = req.body;
    if (!date || !classId || !Array.isArray(records)) {
      return res.status(400).json({ success: false, error: 'Date, class ID, and records array are required' });
    }

    // Verify the user is a teacher for this section
    if (req.user.role === 'teacher') {
      const cls = db.getClassById(parseInt(classId));
      if (!cls || cls.teacher_id !== req.user.teacherId) {
        return res.status(403).json({ success: false, error: 'You are not authorized to mark attendance for this class' });
      }
    }

    // Process each attendance record
    const savedRecords = [];
    for (const record of records) {
      const saved = db.createOrUpdateAttendance(
        parseInt(record.student_id),
        parseInt(classId),
        date,
        record.status,
        req.user.teacherId
      );
      savedRecords.push(saved);
    }

    res.json({ success: true, count: savedRecords.length, data: savedRecords });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/attendance/student/:studentId', (req: Request, res: Response) => {
  try {
    const summary = db.getStudentAttendanceHistory(parseInt(req.params.studentId));
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- System Utilities & Test Runner ---
// Unused admin debug endpoints (legacy stubs)
// apiRouter.post('/system/reset', (_req: Request, res: Response) => {
//   db.resetToSeed();
//   res.json({ success: true, message: 'Database reset to initial sample seed successfully.' });
// });

// apiRouter.get('/system/export', (_req: Request, res: Response) => {
//   res.json(db.exportDatabaseJson());
// });

// apiRouter.post('/tests/run', (_req: Request, res: Response) => {
//   const results = db.runSystemTests();
//   const passedCount = results.filter((r) => r.status === 'passed').length;
//   res.json({
//     success: true,
//     total: results.length,
//     passed: passedCount,
//     failed: results.length - passedCount,
//     timestamp: new Date().toISOString(),
//     results,
//   });
// });