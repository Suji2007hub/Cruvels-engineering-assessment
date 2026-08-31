import React, { useState } from 'react';
import {
  BookOpenCheck,
  CalendarCheck,
  Users,
  Clock,
  School,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Teacher, ClassSection, Student, User } from '../types';

interface TeacherPortalViewProps {
  currentUser: User;
  teachers: Teacher[];
  classes: ClassSection[];
  students: Student[];
  onTakeAttendance: (sectionId: string) => void;
  onSelectStudent: (student: Student) => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  currentUser,
  teachers,
  classes,
  students,
  onTakeAttendance,
  onSelectStudent,
}) => {
  // Find current teacher object
  const currentTeacher =
    teachers.find((t) => t.id === currentUser.teacherId) || teachers[0];

  // Assigned classes
  const assignedClasses = classes.filter(
    (c) =>
      currentTeacher.assignedClassIds?.includes(c.id) ||
      c.classTeacherId === currentTeacher.id ||
      (c.subjectTeacherMap && Object.values(c.subjectTeacherMap).includes(currentTeacher.id))
  );

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    assignedClasses[0]?.id || 'cls-10a'
  );

  const activeSection = classes.find((c) => c.id === selectedSectionId);
  const enrolledStudents = students.filter(
    (s) => s.sectionId === selectedSectionId && s.status === 'Active'
  );

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 font-bold text-xl">
              {currentTeacher.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
                  Faculty Portal • {currentTeacher.department}
                </span>
              </div>
              <h1 className="text-2xl font-bold mt-1 tracking-tight">{currentTeacher.name}</h1>
              <p className="text-xs text-emerald-200 mt-0.5">
                {currentTeacher.qualification} • {currentTeacher.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/60">
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 uppercase font-bold block">Assigned Classes</span>
              <span className="text-lg font-extrabold text-white">{assignedClasses.length} Sections</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Classes Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <School className="w-5 h-5 text-indigo-600" />
            <span>My Assigned Teaching Classes</span>
          </h2>
          <span className="text-xs text-slate-500">Select section to manage attendance & roster</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedClasses.map((cls) => {
            const classStudents = students.filter((s) => s.sectionId === cls.id && s.status === 'Active');
            const isClassTeacher = cls.classTeacherId === currentTeacher.id;
            const isSelected = cls.id === selectedSectionId;

            return (
              <div
                key={cls.id}
                onClick={() => setSelectedSectionId(cls.id)}
                className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/50 border-indigo-600 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{cls.name}</h3>
                    <p className="text-xs text-slate-500">{cls.roomNumber}</p>
                  </div>
                  {isClassTeacher && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Class Teacher
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    <span className="font-bold text-slate-900">{classStudents.length}</span> Enrolled Students
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTakeAttendance(cls.id);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Take Attendance</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Class Roster & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Students Roster for selected class */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Class Roster: {activeSection?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {enrolledStudents.length} active students in {activeSection?.roomNumber}
              </p>
            </div>
            <button
              onClick={() => onTakeAttendance(selectedSectionId)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 flex items-center space-x-1.5 transition-colors"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Mark Today's Attendance</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {enrolledStudents.map((s) => (
              <div
                key={s.id}
                className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-slate-500 w-14">{s.rollNumber}</span>
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[11px] text-slate-400">Guardian: {s.guardianName} ({s.guardianPhone})</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {s.id === 'stu-003' ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      64% • Low Attendance
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      96% Present
                    </span>
                  )}
                  <button
                    onClick={() => onSelectStudent(s)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Student"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Teacher's Weekly Teaching Timetable */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Teaching Timetable</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950">Monday • Period 1</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                  08:30 - 09:15
                </span>
              </div>
              <p className="text-indigo-900 font-medium mt-1">Advanced Mathematics • Grade 10-A</p>
              <p className="text-[10px] text-indigo-600">Room 301 (East Wing)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Monday • Period 2</span>
                <span className="text-[10px] font-medium text-slate-500">09:20 - 10:05</span>
              </div>
              <p className="text-slate-700 font-medium mt-1">Calculus • Grade 10-B</p>
              <p className="text-[10px] text-slate-400">Room 302 (East Wing)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Tuesday • Period 2</span>
                <span className="text-[10px] font-medium text-slate-500">09:20 - 10:05</span>
              </div>
              <p className="text-slate-700 font-medium mt-1">Advanced Mathematics • Grade 10-A</p>
              <p className="text-[10px] text-slate-400">Room 301 (East Wing)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};