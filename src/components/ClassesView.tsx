import React, { useState } from 'react';
import {
  School,
  Plus,
  Users,
  UserCheck,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { ClassSection, Teacher, Student } from '../types.js';

interface ClassesViewProps {
  classes: ClassSection[];
  teachers: Teacher[];
  students: Student[];
  onAddClass: (classData: Partial<ClassSection>) => Promise<void>;
  onUpdateClass: (id: string, updates: Partial<ClassSection>) => Promise<void>;
  onDeleteClass: (id: string) => Promise<void>;
  onRefresh: () => void;
  onSelectStudent: (student: Student) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  classes,
  teachers,
  students,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onRefresh,
  onSelectStudent,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);

  // Form
  const [formData, setFormData] = useState<Partial<ClassSection>>({
    grade: '10',
    section: 'C',
    name: 'Grade 10-C (Diamond)',
    roomNumber: 'Room 303 (East Wing)',
    capacity: 30,
    classTeacherId: teachers[0]?.id || 't-101',
  });
  const [formError, setFormError] = useState('');

  const handleOpenAdd = () => {
    setFormData({
      grade: '10',
      section: 'C',
      name: 'Grade 10-C (Diamond)',
      roomNumber: 'Room 303 (East Wing)',
      capacity: 30,
      classTeacherId: teachers[0]?.id || 't-101',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassSection) => {
    setEditingClass(cls);
    setFormData({ ...cls });
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.grade || !formData.section) {
      setFormError('Class name, grade, and section are required');
      return;
    }

    try {
      if (editingClass) {
        await onUpdateClass(editingClass.id, formData);
        setEditingClass(null);
      } else {
        await onAddClass(formData);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save class section');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete class section ${name}?`)) {
      await onDeleteClass(id);
      onRefresh();
    }
  };

  const getClassTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'Not Assigned';
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown Faculty';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Class & Section Administration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure grade levels, room allocations, class teachers, and timetable schedules ({classes.length} active sections)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class Section</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.sectionId === cls.id && s.status === 'Active');
          const capacityPercent = Math.round(((classStudents.length || 1) / cls.capacity) * 100);

          return (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Room */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 font-bold text-base">
                      {cls.grade}{cls.section}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">{cls.name}</h2>
                      <p className="text-xs text-slate-500">{cls.roomNumber}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100/70 text-purple-800">
                    Grade {cls.grade}
                  </span>
                </div>

                {/* Class Teacher & Details */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Class Teacher:</span>
                    </span>
                    <span className="font-bold text-slate-900">{getClassTeacherName(cls.classTeacherId)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Student Enrollment:</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {classStudents.length} / {cls.capacity} seats ({capacityPercent}%)
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.min(100, capacityPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Subject Mappings */}
                {cls.subjectTeacherMap && Object.keys(cls.subjectTeacherMap).length > 0 && (
                  <div className="mt-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                      Assigned Subjects & Faculty
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(cls.subjectTeacherMap).map(([subj, tId]) => (
                        <div
                          key={subj}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50/60 border border-indigo-100 text-[11px] flex items-center justify-between"
                        >
                          <span className="font-medium text-indigo-900 truncate">{subj}</span>
                          <span className="text-[10px] text-indigo-600 truncate ml-1">
                            {getClassTeacherName(tId as string).split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedClass(cls)}
                  className="inline-flex items-center space-x-1.5 font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Student Roster & Timetable</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Class Section"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cls.id, cls.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {(isAddModalOpen || editingClass) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingClass ? 'Edit Class Section' : 'Create Class Section'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingClass(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {/* Section Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Grade 10-C (Diamond)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Grade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade</label>
                  <select
                    value={formData.grade || '10'}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>

                {/* Section Letter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={formData.section || ''}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. A, B, C"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Room */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Room Allocation
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. Room 303"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={formData.capacity || 30}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Class Teacher */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Class Teacher
                </label>
                <select
                  value={formData.classTeacherId || ''}
                  onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="">None / Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingClass(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingClass ? 'Update Section' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Details, Roster & Timetable Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center">
                  {selectedClass.grade}{selectedClass.section}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedClass.name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedClass.roomNumber} • Class Teacher: {getClassTeacherName(selectedClass.classTeacherId)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Enrolled Students Roster */}
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Enrolled Students ({students.filter((s) => s.sectionId === selectedClass.id).length})
                </h3>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {students
                    .filter((s) => s.sectionId === selectedClass.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedClass(null);
                          onSelectStudent(s);
                        }}
                        className="p-2.5 hover:bg-indigo-50/60 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-[11px] text-slate-400 w-12">{s.rollNumber}</span>
                          <span className="font-semibold text-slate-900">{s.name}</span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-medium hover:underline">
                          View Details →
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Weekly Timetable */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Class Weekly Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedClass.schedule && selectedClass.schedule.length > 0 ? (
                    selectedClass.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900">{item.subject}</span>
                          <p className="text-[10px] text-slate-500">
                            {item.day} • {item.time}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                          Period {item.period}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-3 text-center text-slate-400 bg-slate-50 rounded-xl">
                      Standard timetable active
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
