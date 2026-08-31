import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student, ClassSection } from '../../types';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Student>) => Promise<void>;
  editingStudent: Student | null;
  classes: ClassSection[];
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
  classes,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    gender: 'Male',
    dob: '2009-05-15',
    grade: '10',
    sectionId: classes[0]?.id || 'cls-10a',
    rollNumber: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    bloodGroup: 'O+',
    status: 'Active',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setFormData({ ...editingStudent });
    } else {
      setFormData({
        name: '',
        email: '',
        gender: 'Male',
        dob: '2009-05-15',
        grade: '10',
        sectionId: classes[0]?.id || 'cls-10a',
        rollNumber: `10A-${Math.floor(Math.random() * 80 + 10)}`,
        guardianName: '',
        guardianPhone: '+1 (555) ',
        guardianEmail: '',
        address: '',
        bloodGroup: 'O+',
        status: 'Active',
      });
    }
    setFormError('');
  }, [editingStudent, classes, isOpen]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setFormError('Student full name is required');
      return;
    }
    if (!formData.grade || !formData.sectionId) {
      setFormError('Grade and section are required');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student record');
    }
  };

  if (!isOpen && !editingStudent) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            {editingStudent ? 'Edit Student' : 'Enroll New Student'}
          </h2>
          <button 
            onClick={() => {
              onClose();
            }} 
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender || 'Male'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dob || '2009-05-15'}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grade *</label>
              <select
                value={formData.grade || '10'}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Section *</label>
              <select
                value={formData.sectionId || classes[0]?.id}
                onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.rollNumber || ''}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup || 'O+'}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.guardianName || ''}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardianPhone || ''}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              {editingStudent ? 'Update Student' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};