import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Check,
  RotateCcw,
  Users,
  Search,
  Lock,
  Unlock,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { ClassSection, AttendanceStatus } from '../types';
import { api } from '../services/api';

interface AttendanceViewProps {
  classes: ClassSection[];
  initialSectionId?: string;
  onAttendanceSaved?: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  classes,
  initialSectionId,
  onAttendanceSaved,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId || classes[0]?.id || 'cls-10a'
  );

  // Format YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrectionMode, setIsCorrectionMode] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [search, setSearch] = useState('');

  // Attendance Records State
  const [attendanceData, setAttendanceData] = useState<
    Array<{
      studentId: string;
      studentName: string;
      rollNumber: string;
      gender: string;
      status: AttendanceStatus;
      remarks: string;
      isRecorded: boolean;
    }>
  >([]);

  const fetchAttendance = async () => {
    if (!selectedSectionId || !selectedDate) return;
    setLoading(true);
    setSaveSuccessMessage('');
    setIsCorrectionMode(false);
    setCorrectionReason('');
    try {
      const res = await api.getAttendance(selectedSectionId, selectedDate);
      if (res.success) {
        setAttendanceData(res.data.records);
        setIsSubmitted(res.data.isSubmitted);
      }
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedSectionId, selectedDate]);

  // Bulk actions
  const handleMarkAll = (status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => ({
        ...item,
        status,
      }))
    );
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status } : item))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccessMessage('');
    try {
      const payload = {
        date: selectedDate,
        sectionId: selectedSectionId,
        records: attendanceData.map((item) => ({
          studentId: item.studentId,
          status: item.status,
          remarks: correctionReason
            ? `${item.remarks ? item.remarks + ' | ' : ''}[Correction: ${correctionReason}]`
            : item.remarks,
        })),
      };
      const res = await api.saveAttendance(payload);
      if (res.success) {
        setSaveSuccessMessage(
          isCorrectionMode
            ? `Attendance corrections saved successfully!`
            : `Attendance recorded for ${res.count} students!`
        );
        setIsSubmitted(true);
        setIsCorrectionMode(false);
        setCorrectionReason('');
        if (onAttendanceSaved) onAttendanceSaved();
        setTimeout(() => setSaveSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const cls = classes.find((c) => c.id === selectedSectionId);
    const headers = 'RollNumber,StudentName,Status,Date,ClassSection,Remarks\n';
    const rows = attendanceData
      .map(
        (a) =>
          `"${a.rollNumber}","${a.studentName}","${a.status}","${selectedDate}","${cls?.name || selectedSectionId}","${a.remarks || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${cls?.name || 'Class'}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculation
    const total = attendanceData.length;
    const presentCount = attendanceData.filter((a) => a.status === 'present').length;
    const lateCount = attendanceData.filter((a) => a.status === 'late').length;
    const absentCount = attendanceData.filter((a) => a.status === 'absent').length;
    const attendanceRate =
      total > 0 ? Math.round(((presentCount + lateCount * 0.8) / total) * 100) : 0;

  const currentClass = classes.find((c) => c.id === selectedSectionId);

  const filteredRecords = attendanceData.filter(
    (item) =>
      search === '' ||
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Daily Attendance Register</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark, review, correct, and persist daily classroom attendance records with remarks and audit tracking
          </p>
        </div>

        {/* Actions button */}
        <div className="flex items-center space-x-2">
          {saveSuccessMessage && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </span>
          )}

          {/* Export Day's Sheet */}
          <button
            onClick={handleExportCsv}
            disabled={total === 0}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Sheet</span>
          </button>

          {/* Save / Submit Button */}
          {(!isSubmitted || isCorrectionMode) ? (
            <button
              onClick={handleSave}
              disabled={saving || loading || total === 0}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? 'Saving...'
                  : isCorrectionMode
                  ? 'Save Corrections'
                  : 'Save & Submit Attendance'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsCorrectionMode(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl transition-all shadow-2xs"
            >
              <Unlock className="w-4 h-4 text-amber-600" />
              <span>Unlock & Correct Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Submitted / Locked Notification */}
      {isSubmitted && !isCorrectionMode && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">
              Attendance already submitted and officially recorded for {selectedDate}.
            </span>
          </div>
          <button
            onClick={() => setIsCorrectionMode(true)}
            className="text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Need to adjust an entry? Click to unlock</span>
          </button>
        </div>
      )}

      {/* Correction Mode Banner */}
      {isCorrectionMode && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Attendance Correction Mode Active</span>
            </div>
            <button
              onClick={() => setIsCorrectionMode(false)}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Cancel Correction
            </button>
          </div>
          <p className="text-amber-800 text-[11px]">
            Please enter a revision note below. Your changes will be saved to the system audit history.
          </p>
          <input
            type="text"
            value={correctionReason}
            onChange={(e) => setCorrectionReason(e.target.value)}
            placeholder="e.g. Medical certificate provided by parent / late bus correction"
            className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-400"
          />
        </div>
      )}

      {/* Control Strip: Date Picker, Class Selector & Quick Bulk Buttons */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          {/* Section Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Class Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-indigo-500"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.roomNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Date Quick Jumps */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quick Date</label>
            <div className="flex space-x-1.5">
              <button
                type="button"
                onClick={() => setSelectedDate(getTodayStr())}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex-1 ${
                  selectedDate === getTodayStr()
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors flex-1"
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Bulk Action Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bulk Marking</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleMarkAll('present')}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex-1"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('absent')}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex-1"
              >
                Clear/Reset
              </button>
            </div>
          </div>
        </div>

        {/* Live Attendance Metric Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Enrolled: {total}</span>
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              Present: {presentCount}
            </span>
            <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              Late: {lateCount}
            </span>
            <span className="font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
              Absent: {absentCount}
            </span>
            <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">

            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Session Rate:</span>
            <span
              className={`font-extrabold text-sm px-2.5 py-0.5 rounded-lg ${
                attendanceRate >= 85
                  ? 'bg-emerald-100 text-emerald-800'
                  : attendanceRate >= 75
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {attendanceRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Search within roster */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student in section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <p className="text-xs text-slate-400">
          Click status pill to toggle: <span className="text-emerald-700 font-bold">P</span> (Present),{' '}
          <span className="text-amber-700 font-bold">L</span> (Late),{' '}
          <span className="text-rose-700 font-bold">A</span> (Absent),{' '}
          <span className="text-blue-700 font-bold">E</span> (Excused)
        </p>
      </div>

      {/* Student Attendance List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading class attendance records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16">Roll #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 w-72 text-center">Attendance Status</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No students enrolled in this section.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.studentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        record.status === 'absent' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Roll */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {record.rollNumber}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{record.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {record.studentId}
                        </span>
                      </td>

                      {/* Status Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.studentId, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              record.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.studentId, 'late')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              record.status === 'late'
                                ? 'bg-amber-500 text-white shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.studentId, 'absent')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              record.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs scale-105'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>


                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={record.remarks || ''}
                          onChange={(e) => handleRemarksChange(record.studentId, e.target.value)}
                          placeholder="Optional note (e.g. sick leave, late arrival)"
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};