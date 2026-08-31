import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Award,
  Calendar,
  X,
  AlertCircle,
  GraduationCap,
  School,
} from 'lucide-react';
import { Teacher, ClassSection } from '../types';

interface TeachersViewProps {
  teachers: Teacher[];
  classes: ClassSection[];
  onAddTeacher: (teacherData: Partial<Teacher>) => Promise<void>;
  onUpdateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  teachers,
  classes,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    department: 'Mathematics & Computing',
    subjects: ['Advanced Mathematics'],
    assignedClassIds: ['cls-10a'],
    status: 'Active',
  });
  const [subjectsInput, setSubjectsInput] = useState('Advanced Mathematics, Calculus');
  const [formError, setFormError] = useState('');

  const departments = [
    'All',
    'Mathematics & Computing',
    'Natural Sciences',
    'Humanities & Languages',
  ];

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.teacherCode.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'All' || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '+1 (555) ',
      qualification: 'M.Sc. / B.Ed',
      department: 'Mathematics & Computing',
      subjects: ['Advanced Mathematics'],
      assignedClassIds: [classes[0]?.id || 'cls-10a'],
      status: 'Active',
    });
    setSubjectsInput('Advanced Mathematics, Calculus');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ ...teacher });
    setSubjectsInput(teacher.subject || '');
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.department) {
      setFormError('Name, email, and department are required');
      return;
    }

    const parsedSubjects = subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (editingTeacher) {
        await onUpdateTeacher(editingTeacher.id, {
          ...formData,
          subjects: parsedSubjects,
        });
        setEditingTeacher(null);
      } else {
        await onAddTeacher({
          ...formData,
          subjects: parsedSubjects,
        });
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save faculty record');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove faculty member ${name}?`)) {
      await onDeleteTeacher(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Faculty & Teacher Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage academic staff profiles, department assignments, and subject allocation ({teachers.length} faculty members)
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by teacher name, department, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500">Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => {
          const assignedClasses = classes.filter(
            (c) => teacher.assignedClassIds?.includes(c.id) || c.classTeacherId === teacher.id
          );

          return (
            <div
              key={teacher.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">{teacher.name}</h2>
                      <span className="text-[11px] font-mono text-slate-400">{teacher.teacherCode}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      teacher.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {teacher.status}
                  </span>
                </div>

                {/* Qualification & Department */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{teacher.department}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{teacher.qualification}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-500">{teacher.email}</span>
                  </div>
                </div>

                {/* Subjects & Classes */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Teaching Subjects
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Assigned Sections ({assignedClasses.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {assignedClasses.map((cls) => (
                        <span
                          key={cls.id}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {cls.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingTeacher(teacher)}
                  className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Timetable</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Teacher"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id, teacher.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Teacher"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Teacher Modal */}
      {(isAddModalOpen || editingTeacher) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingTeacher ? 'Edit Faculty Details' : 'Add Faculty Member'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTeacher(null);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Robert Vance"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@school.edu"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department || 'Mathematics & Computing'}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Mathematics & Computing">Mathematics & Computing</option>
                    <option value="Natural Sciences">Natural Sciences</option>
                    <option value="Humanities & Languages">Humanities & Languages</option>
                  </select>
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification || ''}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. Ph.D. / M.Sc. in Physics"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Subjects (Comma separated) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subjects Taught (comma separated)
                  </label>
                  <input
                    type="text"
                    value={subjectsInput}
                    onChange={(e) => setSubjectsInput(e.target.value)}
                    placeholder="e.g. Advanced Mathematics, Statistics, Calculus"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTeacher(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingTeacher ? 'Update Faculty' : 'Add Faculty Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Details & Timetable Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {viewingTeacher.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{viewingTeacher.name}</h2>
                  <p className="text-xs text-slate-500">
                    {viewingTeacher.department} • {viewingTeacher.teacherCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Qualification</span>
                  <span className="font-bold text-slate-800">{viewingTeacher.qualification}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Joining Date</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.joinDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-slate-800">{viewingTeacher.email}</span>
                </div>
              </div>

              {/* Weekly Assigned Schedule */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Assigned Teaching Schedule</span>
                </h3>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950">Monday • Period 1 (08:30 - 09:15)</span>
                      <p className="text-[11px] text-indigo-700">Advanced Mathematics • Grade 10-A</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                      Room 301
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950">Monday • Period 2 (09:20 - 10:05)</span>
                      <p className="text-[11px] text-indigo-700">Calculus • Grade 10-B</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                      Room 302
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-indigo-950">Tuesday • Period 2 (09:20 - 10:05)</span>
                      <p className="text-[11px] text-indigo-700">Advanced Mathematics • Grade 10-A</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/60 text-indigo-800">
                      Room 301
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};