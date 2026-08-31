import React, { useState } from 'react';
import { Plus, Download, FileSpreadsheet } from 'lucide-react';
import { Student, ClassSection } from '../types';
import { StudentFilters } from './students/StudentFilters.js';
import { StudentsTable } from './students/StudentsTable.js';
import { StudentFormModal } from './students/StudentFormModal.js';
import { CsvImportModal } from './students/CsvImportModal.js';
import { StudentProfileModal } from './students/StudentProfileModal.js';

interface StudentsViewProps {
  students: Student[];
  classes: ClassSection[];
  onAddStudent: (studentData: Partial<Student>) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  selectedStudentModal: Student | null;
  setSelectedStudentModal: (student: Student | null) => void;
  onRefresh: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  selectedStudentModal,
  setSelectedStudentModal,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(search.toLowerCase());

    const matchesGrade = gradeFilter === 'All' || s.grade === gradeFilter;
    const matchesSection = sectionFilter === 'All' || s.sectionId === sectionFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesSearch && matchesGrade && matchesSection && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsAddModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (student: Student) => {
    const nextStatus = student.is_active === 1 ? 0 : 1;
    try {
      await onUpdateStudent(student.id, { is_active: nextStatus });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle student status:', err);
    }
  };

  const handleFormSubmit = async (formData: Partial<Student>) => {
    try {
      if (editingStudent) {
        await onUpdateStudent(editingStudent.id, formData);
        setEditingStudent(null);
      } else {
        await onAddStudent(formData);
        setIsAddModalOpen(false);
      }
      onRefresh();
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove student ${name} from the school directory?`)) {
      await onDeleteStudent(id);
      onRefresh();
    }
  };

  const getClassName = (sectionId: string) => {
    const cls = classes.find((c) => c.id === sectionId);
    return cls ? cls.name : sectionId;
  };

  const handleExportFilteredCsv = () => {
    const headers = 'StudentCode,Name,Email,Grade,Section,RollNumber,GuardianName,GuardianPhone,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.studentCode}","${s.name}","${s.email}","${s.grade}","${getClassName(s.sectionId)}","${s.rollNumber}","${s.guardianName}","${s.guardianPhone}","${s.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Student Directory & Profiles</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student enrollments, guardian contacts, section allocations, and attendance records ({students.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Export CSV Button */}
          <button
            onClick={handleExportFilteredCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
            title="Export filtered directory to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import CSV</span>
          </button>

          {/* Enroll Single Student */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Student Filters */}
      <StudentFilters
        search={search}
        setSearch={setSearch}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        sectionFilter={sectionFilter}
        setSectionFilter={setSectionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        classes={classes}
      />

      {/* Students Data Table */}
      <StudentsTable
        students={filteredStudents}
        classes={classes}
        onViewStudent={setSelectedStudentModal}
        onEditStudent={handleOpenEdit}
        onDeleteStudent={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Modals */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        editingStudent={editingStudent}
        classes={classes}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportComplete={onRefresh}
        classes={classes}
      />

      <StudentProfileModal
        student={selectedStudentModal}
        onClose={() => setSelectedStudentModal(null)}
        classes={classes}
      />
    </div>
  );
};