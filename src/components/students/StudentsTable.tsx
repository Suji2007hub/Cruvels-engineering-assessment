import React from 'react';
import { Eye, Edit2, Trash2, Power } from 'lucide-react';
import { Student, ClassSection } from '../../types';

interface StudentsTableProps {
  students: Student[];
  classes: ClassSection[];
  onViewStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string, name: string) => void;
  onToggleStatus: (student: Student) => void;
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  classes,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onToggleStatus,
}) => {
  const getClassName = (sectionId: string) => {
    const cls = classes.find((c) => c.id === sectionId);
    return cls ? cls.name : sectionId;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Code & Roll</th>
              <th className="py-3 px-4">Grade & Section</th>
              <th className="py-3 px-4">Guardian Details</th>
              <th className="py-3 px-4">Status & Action</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No students match the current filters.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Student Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Code & Roll */}
                  <td className="py-3 px-4">
                    <div className="font-mono text-slate-800 font-medium">{student.studentCode}</div>
                    <div className="text-[11px] text-slate-400">Roll: {student.rollNumber}</div>
                  </td>

                  {/* Grade & Section */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800">
                      {getClassName(student.sectionId)}
                    </span>
                    <div className="text-[11px] text-slate-400">Grade {student.grade}</div>
                  </td>

                  {/* Guardian */}
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{student.guardianName}</p>
                    <p className="text-[11px] text-slate-400">{student.guardianPhone}</p>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onToggleStatus(student)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                        student.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title="Click to toggle Active / Inactive"
                    >
                      <Power className="w-3 h-3" />
                      <span>{student.status}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onViewStudent(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View Profile & Attendance History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(student.id, student.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};