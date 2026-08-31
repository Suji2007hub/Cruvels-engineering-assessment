import React from 'react';
import { X, Phone, Mail, Calendar, User, GraduationCap } from 'lucide-react';
import { Student, ClassSection } from '../../types';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  classes: ClassSection[];
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  classes,
}) => {
  if (!student) return null;

  const getClassName = (sectionId: string) => {
    const cls = classes.find((c) => c.id === sectionId);
    return cls ? cls.name : sectionId;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">Student Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xl">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-500">Student Code: {student.studentCode}</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                student.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {student.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Email</p>
                <p className="text-xs font-medium text-slate-800">{student.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Guardian Phone</p>
                <p className="text-xs font-medium text-slate-800">{student.guardianPhone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Date of Birth</p>
                <p className="text-xs font-medium text-slate-800">{student.dob}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Class & Section</p>
                <p className="text-xs font-medium text-slate-800">{getClassName(student.sectionId)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Guardian</p>
                <p className="text-xs font-medium text-slate-800">{student.guardianName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-500">Roll Number</p>
                <p className="text-xs font-medium text-slate-800">{student.rollNumber}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Address</h4>
            <p className="text-xs text-slate-600">{student.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};