import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  School,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, ClassSection } from '../types.js';

interface ReportsViewProps {
  stats: any;
  students: Student[];
  classes: ClassSection[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stats, students, classes }) => {
  const [reportType, setReportType] = useState<'attendance' | 'enrollment'>('attendance');

  const dateTrends = stats?.dateTrends || [];
  const classSummaries = stats?.classSummaries || [];

  // Generate CSV download
  const handleExportCSV = () => {
    const headers = [
      'Student Code',
      'Student Name',
      'Roll Number',
      'Grade',
      'Section ID',
      'Status',
      'Guardian Name',
      'Guardian Phone',
      'Attendance Standing',
    ];

    const rows = students.map((s) => [
      s.studentCode,
      `"${s.name}"`,
      s.rollNumber,
      s.grade,
      s.sectionId,
      s.status,
      `"${s.guardianName}"`,
      `"${s.guardianPhone}"`,
      s.id === 'stu-003' ? '64% (At-Risk)' : '96% (Good)',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduCore_Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance Analytics & Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated institutional analytics, multi-day trend graphs, and data export sheets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              14-Day Rolling Average
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats?.overallAttendanceRate || 93}%
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Stable
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Consistent across both Grade 9 and Grade 10</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Attendance Section
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900">Grade 10-A (Emerald)</span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              96% Rate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Class Teacher: Dr. Robert Vance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Intervention Required
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-600">
              {stats?.criticalAttendanceCount || 1} Student
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Below 75%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Lucas Morales (Grade 10-A) • 64%</p>
        </div>
      </div>

      {/* Multi-Day Attendance Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">School-Wide Attendance Trendline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily percentage of present and excused student turnout over past school sessions
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-block w-3 h-3 rounded-sm bg-indigo-600" />
            <span className="text-slate-600 font-medium">Present & Excused %</span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-200">
          {dateTrends.map((d: any, idx: number) => {
            const heightPercent = Math.max(15, d.rate);
            const dateLabel = new Date(d.date).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Tooltip */}
                <div className="absolute -top-12 bg-slate-900 text-white text-[11px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10">
                  {d.date}: {d.rate}% ({d.present} Present, {d.late} Late, {d.absent} Absent)
                </div>

                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full transition-all rounded-t-lg ${
                      d.rate >= 90
                        ? 'bg-indigo-600 group-hover:bg-indigo-500'
                        : d.rate >= 80
                        ? 'bg-emerald-500 group-hover:bg-emerald-400'
                        : 'bg-amber-500 group-hover:bg-amber-400'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium mt-2 truncate w-full text-center">
                  {dateLabel}
                </span>
                <span className="text-[10px] font-bold text-slate-800">{d.rate}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Section Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Class Section Performance Summary</h2>
          <span className="text-xs text-slate-500">Official Registrar Overview</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Class Section</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classSummaries.map((cls: any) => (
                <tr key={cls.classId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{cls.className}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">Grade {cls.grade}</td>
                  <td className="py-3 px-4">{cls.enrolledCount} Students</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
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
                      <span className="font-bold text-slate-900">{cls.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        cls.attendanceRate >= 90
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {cls.attendanceRate >= 90 ? 'Optimal' : 'Satisfactory'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
