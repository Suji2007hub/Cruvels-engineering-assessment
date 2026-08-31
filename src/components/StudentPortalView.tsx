import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Heart,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Student, ClassSection, Teacher, User as UserType } from '../types.js';
import { api } from '../services/api.js';

interface StudentPortalViewProps {
  currentUser: UserType;
  students: Student[];
  classes: ClassSection[];
  teachers: Teacher[];
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  currentUser,
  students,
  classes,
  teachers,
}) => {
  // Determine active student
  const activeStudentId = currentUser.studentId || 'stu-001';
  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [attendanceSummary, setAttendanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable' | 'teachers'>('attendance');

  useEffect(() => {
    if (!currentStudent) return;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await api.getStudentAttendanceSummary(currentStudent.id);
        if (res.success) {
          setAttendanceSummary(res.data);
        }
      } catch (err) {
        console.error('Error fetching student attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [currentStudent?.id]);

  if (!currentStudent) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <p className="text-slate-500 text-sm">No student profile currently loaded.</p>
      </div>
    );
  }

  const studentClass = classes.find((c) => c.id === currentStudent.sectionId);
  const classTeacher = teachers.find((t) => t.id === studentClass?.classTeacherId);

  const percentage = attendanceSummary?.percentage ?? 95;
  const isGoodStanding = percentage >= 85;
  const isWarning = percentage >= 75 && percentage < 85;

  const records = attendanceSummary?.records || [];
  const filteredRecords = records.filter((r: any) => {
    if (statusFilter === 'All') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner & Profile Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600 border-2 border-indigo-400/40 flex items-center justify-center text-white text-2xl font-black shadow-inner">
              {currentStudent.avatar ? (
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                currentStudent.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{currentStudent.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {currentStudent.studentCode}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {currentStudent.status}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Grade {currentStudent.grade} • {studentClass?.name || 'Class Section'} • Roll No: {currentStudent.rollNumber}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{currentStudent.email}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 text-rose-300" />
                  <span>Blood Group: {currentStudent.bloodGroup || 'O+'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  <span>DOB: {currentStudent.dob}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Academic Standing Badge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 min-w-[200px] text-right">
            <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">
              Overall Attendance
            </p>
            <div className="text-3xl font-extrabold text-white mt-0.5">{percentage}%</div>
            <div className="mt-1 flex items-center justify-end space-x-1 text-xs">
              {isGoodStanding ? (
                <span className="text-emerald-300 font-medium flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Good Standing
                </span>
              ) : isWarning ? (
                <span className="text-amber-300 font-medium flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Regular Review
                </span>
              ) : (
                <span className="text-rose-300 font-medium flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Attendance Alert
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total School Days</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {attendanceSummary?.totalDays ?? 24}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded academic sessions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-xs bg-gradient-to-b from-white to-emerald-50/20">
          <p className="text-xs font-medium text-emerald-700 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Days Present
          </p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">
            {attendanceSummary?.present ?? 22}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Full session attendance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs bg-gradient-to-b from-white to-amber-50/20">
          <p className="text-xs font-medium text-amber-700 flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" /> Late / Excused
          </p>
          <p className="text-2xl font-bold text-amber-800 mt-1">
            {(attendanceSummary?.late || 0) + (attendanceSummary?.excused || 0)}
          </p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            {attendanceSummary?.late || 1} Late, {attendanceSummary?.excused || 0} Excused
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-xs bg-gradient-to-b from-white to-rose-50/20">
          <p className="text-xs font-medium text-rose-700 flex items-center">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Days Absent
          </p>
          <p className="text-2xl font-bold text-rose-800 mt-1">
            {attendanceSummary?.absent ?? 1}
          </p>
          <p className="text-[11px] text-rose-600 mt-0.5">Unexcused missed days</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'attendance'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Attendance Log History</span>
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'timetable'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Class Timetable & Schedule</span>
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-3 font-semibold transition-colors flex items-center space-x-2 ${
            activeTab === 'teachers'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Teachers & Guardian Info</span>
        </button>
      </div>

      {/* Tab 1: Attendance Log History */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recorded Attendance Timeline</h3>
              <p className="text-xs text-slate-500">Daily verification status recorded by faculty</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Filter Status:</span>
              <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                {['All', 'Present', 'Absent', 'Late', 'Excused'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Recorded Time</th>
                  <th className="py-3 px-4">Remarks & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No attendance records found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r: any) => {
                    const statusColor =
                      r.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : r.status === 'Absent'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : r.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {new Date(r.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusColor}`}
                          >
                            {r.status === 'Present' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {r.status === 'Absent' && <XCircle className="w-3 h-3 mr-1" />}
                            {r.status === 'Late' && <Clock className="w-3 h-3 mr-1" />}
                            {r.status === 'Excused' && <ShieldCheck className="w-3 h-3 mr-1" />}
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{r.recordedBy || 'Class Teacher'}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {r.timestamp
                            ? new Date(r.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '08:30 AM'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.remarks ? (
                            <span className="italic">{r.remarks}</span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Timetable & Schedule */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Weekly Class Timetable</h3>
              <p className="text-xs text-slate-500">
                {studentClass?.name} • Room {studentClass?.roomNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
              const daySchedule = studentClass?.schedule?.filter((s) => s.day === day) || [];
              return (
                <div key={day} className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col">
                  <div className="font-bold text-xs text-indigo-900 border-b border-slate-200 pb-2 mb-2 flex items-center justify-between">
                    <span>{day}</span>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      {daySchedule.length} Periods
                    </span>
                  </div>
                  <div className="space-y-2 flex-1">
                    {daySchedule.length === 0 ? (
                      <p className="text-[11px] text-slate-400 py-4 text-center">Self-study / Library</p>
                    ) : (
                      daySchedule.map((p, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs text-xs"
                        >
                          <div className="font-semibold text-slate-900">{p.subject}</div>
                          <div className="text-[11px] text-indigo-600 font-medium mt-0.5">{p.time}</div>
                          {p.teacherId && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              {teachers.find((t) => t.id === p.teacherId)?.name || 'Faculty Member'}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Teachers & Guardian Info */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class & Subject Teachers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Assigned Faculty & Class Teacher</span>
            </h3>

            {classTeacher && (
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-4 flex items-start space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {classTeacher.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-900">
                    Class Teacher
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1">{classTeacher.name}</p>
                  <p className="text-xs text-slate-500">{classTeacher.department}</p>
                  <div className="mt-2 flex flex-col space-y-1 text-xs text-slate-600">
                    <span className="flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{classTeacher.email}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{classTeacher.phone}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Subject Instructors
              </h4>
              <div className="space-y-2">
                {Object.entries(studentClass?.subjectTeacherMap || {}).map(([subject, tId]) => {
                  const teacher = teachers.find((t) => t.id === tId);
                  return (
                    <div
                      key={subject}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-800">{subject}</span>
                      <span className="text-slate-600">{teacher?.name || 'Assigned Faculty'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Guardian / Parent Contacts */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Parent / Guardian & Emergency Contact</span>
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-400">Primary Guardian</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{currentStudent.guardianName}</p>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">{currentStudent.guardianPhone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-700">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span>{currentStudent.guardianEmail}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{currentStudent.address}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1">Administrative Note</p>
                <p className="leading-relaxed">
                  For attendance rectifications, medical leave applications, or address updates, please
                  contact the school administration office at{' '}
                  <span className="text-indigo-600 font-medium">admin@school.edu</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
