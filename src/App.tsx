import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Header } from './components/layout/Header.js';
import { Sidebar, NavTab } from './components/layout/Sidebar.js';
import { DashboardView } from './components/views/DashboardView.js';
import { StudentsView } from './components/StudentsView.js';
import { TeachersView } from './components/TeachersView.js';
import { ClassesView } from './components/ClassesView.js';
import { AttendanceView } from './components/AttendanceView.js';
import { TeacherPortalView } from './components/TeacherPortalView.js';
import { StudentPortalView } from './components/StudentPortalView.js';
import { ReportsView } from './components/ReportsView.js';
import { api } from './services/api.js';
import { User, Student, Teacher, ClassSection } from './types.js';

// Auth Context
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Page Component
const LoginPage: React.FC<{ onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }> }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await onLogin(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">EduCore</h1>
          <p className="text-slate-600">School Management System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Demo credentials: admin@school.test / Admin@123 (admin)
            <br />
            teacher1@school.test / Teacher@123 (teacher)
            <br />
            student1@school.test / Student@123 (student)
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected student for quick modal view
  const [selectedStudentModal, setSelectedStudentModal] = useState<Student | null>(null);
  const [attendancePreselectedSection, setAttendancePreselectedSection] = useState<string | undefined>(
    undefined
  );

  // Check if user is already logged in
  const checkAuth = async () => {
    try {
      const userRes = await api.getCurrentUser();
      if (userRes.success) {
        setCurrentUser(userRes.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await api.login(email, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        // Load all data after successful login
        await loadAllData();
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setStats(null);
    setStudents([]);
    setTeachers([]);
    setClasses([]);
  };

  // Initial load of all data
  const loadAllData = async () => {
    try {
      const [statsRes, stuRes, tchRes, clsRes] = await Promise.all([
        api.getStats(),
        api.getStudents(),
        api.getTeachers(),
        api.getClasses(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (stuRes.success) setStudents(stuRes.data);
      if (tchRes.success) setTeachers(tchRes.data);
      if (clsRes.success) setClasses(clsRes.data);
    } catch (error) {
      console.error('Error loading school ERP data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);



  // Shortcut to take attendance for a specific section
  const handleTakeAttendanceForSection = (sectionId: string) => {
    setAttendancePreselectedSection(sectionId);
    setActiveTab('attendance');
  };

  // CRUD Handlers for Students
  const handleAddStudent = async (data: Partial<Student>) => {
    await api.createStudent(data);
    await loadAllData();
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    await api.updateStudent(id, updates);
    await loadAllData();
  };

  const handleDeleteStudent = async (id: string) => {
    await api.deleteStudent(id);
    await loadAllData();
  };

  // CRUD Handlers for Teachers
  const handleAddTeacher = async (data: Partial<Teacher>) => {
    await api.createTeacher(data);
    await loadAllData();
  };

  const handleUpdateTeacher = async (id: string, updates: Partial<Teacher>) => {
    await api.updateTeacher(id, updates);
    await loadAllData();
  };

  const handleDeleteTeacher = async (id: string) => {
    await api.deleteTeacher(id);
    await loadAllData();
  };

  // CRUD Handlers for Classes
  const handleAddClass = async (data: Partial<ClassSection>) => {
    await api.createClass(data);
    await loadAllData();
  };

  const handleUpdateClass = async (id: string, updates: Partial<ClassSection>) => {
    await api.updateClass(id, updates);
    await loadAllData();
  };

  const handleDeleteClass = async (id: string) => {
    await api.deleteClass(id);
    await loadAllData();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Checking authentication...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide">Loading EduCore School ERP...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, login: handleLogin, logout: handleLogout, isLoading: isAuthLoading }}>
      <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col antialiased">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
        />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          criticalCount={stats?.criticalAttendanceCount || 0}
        />

        {/* View Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              students={students}
              onNavigate={setActiveTab}
              onSelectStudent={(stu) => {
                setSelectedStudentModal(stu);
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              selectedStudentModal={selectedStudentModal}
              setSelectedStudentModal={setSelectedStudentModal}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'teachers' && (
            <TeachersView
              teachers={teachers}
              classes={classes}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              teachers={teachers}
              students={students}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              onRefresh={loadAllData}
              onSelectStudent={(stu) => {
                setSelectedStudentModal(stu);
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              classes={classes}
              initialSectionId={attendancePreselectedSection}
              onAttendanceSaved={loadAllData}
            />
          )}

          {activeTab === 'teacher-portal' && (
            <TeacherPortalView
              currentUser={currentUser}
              teachers={teachers}
              classes={classes}
              students={students}
              onTakeAttendance={handleTakeAttendanceForSection}
              onSelectStudent={(stu) => {
                setSelectedStudentModal(stu);
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'student-portal' && (
            <StudentPortalView
              currentUser={currentUser}
              students={students}
              classes={classes}
              teachers={teachers}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              stats={stats}
              students={students}
              classes={classes}
            />
          )}
        </main>
      </div>
    </div>
    </AuthContext.Provider>
  );
}