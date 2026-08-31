import React from 'react';
import { Search, Filter } from 'lucide-react';
import { ClassSection } from '../../types.js';

interface StudentFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  gradeFilter: string;
  setGradeFilter: (value: string) => void;
  sectionFilter: string;
  setSectionFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  classes: ClassSection[];
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  search,
  setSearch,
  gradeFilter,
  setGradeFilter,
  sectionFilter,
  setSectionFilter,
  statusFilter,
  setStatusFilter,
  classes,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by student name, code, or roll #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Grade */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          <span>Grade:</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="All">All Grades</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
          </select>
        </div>

        {/* Section */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span>Section:</span>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="All">All Sections</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-500">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>
    </div>
  );
};