import React from 'react';
import {
  GraduationCap,
  Users,
  School,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar.js';
import { Student } from '../types.js';

interface DashboardViewProps {
  stats: any;
  students: Student[];
  onNavigate: (tab: NavTab) => void;
  onSelectStudent: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  students,
  onNavigate,
  onSelectStudent,
}) => {
  const today = stats?.todaySummary || {
    totalEnrolled: 20,
    marked: 20,
    present: 18,
    late: 1,
    absent: 1,
    excused: 0,
    percentage: 95,
  };

  const criticalStudents = students.filter((s) => s.id === 'stu-003' || s.id === 'stu-016');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              Academic Term 2026 • Spring Semester
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2 tracking-tight">School Administration Dashboard</h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
            Live overview of student enrollments, faculty teaching allocations, active classroom sections, and daily attendance trends.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2.5 bg-white text-indigo-900 font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-50 transition-all flex items-center space-x-2"
          >
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
            <span>Mark Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 20}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Across 4 class sections</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </p>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty & Teachers
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.totalTeachers || 6}</span>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              3 Departments
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Math, Science & Humanities</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </p>
        </div>

        {/* Active Class Sections */}
        <div
          onClick={() => onNavigate('classes')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Sections
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <School className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats?.totalClasses || 4}</span>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Grades 9 & 10
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Capacity avg: 65%</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-colors" />
          </p>
        </div>

        {/* Overall Attendance Rate */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance Today
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{today.percentage}%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {today.present} / {today.totalEnrolled} Present
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Historical Avg: {stats?.overallAttendanceRate || 93}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Attendance Breakdown & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Today Breakdown & Quick Register Shortcut */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Attendance Register Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Today's Daily Attendance Pulse</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status breakdown for date: {stats?.todayDate || 'Today'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('attendance')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Full Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attendance Status Bar */}
            <div className="space-y-3">
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(today.present / (today.totalEnrolled || 1)) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Present: ${today.present}`}
                />
                <div
                  style={{ width: `${(today.late / (today.totalEnrolled || 1)) * 100}%` }}
                  className="bg-amber-400 h-full transition-all"
                  title={`Late: ${today.late}`}
                />
                <div
                  style={{ width: `${(today.excused / (today.totalEnrolled || 1)) * 100}%` }}
                  className="bg-blue-400 h-full transition-all"
                  title={`Excused: ${today.excused}`}
                />
                <div
                  style={{ width: `${(today.absent / (today.totalEnrolled || 1)) * 100}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Absent: ${today.absent}`}
                />
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-800 font-medium">Present</div>
                    <div className="text-lg font-bold text-emerald-950">{today.present}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-amber-800 font-medium">Late</div>
                    <div className="text-lg font-bold text-amber-950">{today.late}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-rose-800 font-medium">Absent</div>
                    <div className="text-lg font-bold text-rose-950">{today.absent}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-blue-800 font-medium">Excused</div>
                    <div className="text-lg font-bold text-blue-950">{today.excused}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Class-by-Class Attendance Progress */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Section Attendance Rates
              </h3>
              <div className="space-y-3">
                {stats?.classSummaries?.map((cls: any) => (
                  <div key={cls.classId} className="flex items-center justify-between text-xs">
                    <div className="w-48 font-medium text-slate-800 truncate">{cls.className}</div>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cls.attendanceRate >= 90
                              ? 'bg-emerald-500'
                              : cls.attendanceRate >= 75
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${cls.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-bold text-slate-900">
                      {cls.attendanceRate}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              Administrative Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => onNavigate('students')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex flex-col items-start"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-900">Enroll Student</span>
                <span className="text-[10px] text-slate-400">Add to roster</span>
              </button>

              <button
                onClick={() => onNavigate('teachers')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex flex-col items-start"
              >
                <Users className="w-4 h-4 text-emerald-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-900">Add Teacher</span>
                <span className="text-[10px] text-slate-400">Assign subjects</span>
              </button>

              <button
                onClick={() => onNavigate('classes')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex flex-col items-start"
              >
                <School className="w-4 h-4 text-purple-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-900">New Class</span>
                <span className="text-[10px] text-slate-400">Set room & capacity</span>
              </button>

              <button
                onClick={() => onNavigate('reports')}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left flex flex-col items-start"
              >
                <TrendingUp className="w-4 h-4 text-amber-600 mb-1.5" />
                <span className="text-xs font-bold text-slate-900">Export Report</span>
                <span className="text-[10px] text-slate-400">CSV & Analytics</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: At-Risk Students & Recent Audit Activity Stream */}
        <div className="space-y-6">
          {/* Critical Attendance Alert Card */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-xs">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attendance Watch-List</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Students falling below mandatory 75% attendance threshold
            </p>

            <div className="space-y-2.5">
              {criticalStudents.map((stu) => (
                <div
                  key={stu.id}
                  onClick={() => onSelectStudent(stu)}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{stu.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Roll: {stu.rollNumber} • Grade {stu.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                      {stu.id === 'stu-003' ? '64%' : '78%'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Review Profile</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Recent Audit Log</h2>
              <span className="text-[11px] text-slate-400">Live system events</span>
            </div>

            <div className="space-y-3.5">
              {stats?.recentActivities?.map((log: any) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{log.action}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-indigo-600 font-medium">{log.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};