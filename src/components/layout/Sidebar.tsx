import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  School,
  CalendarCheck,
  BookOpenCheck,
  BarChart3,
  Bell,
} from 'lucide-react';
import { User } from '../types.js';

export type NavTab =
  | 'dashboard'
  | 'students'
  | 'teachers'
  | 'classes'
  | 'attendance'
  | 'teacher-portal'
  | 'student-portal'
  | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User;
  criticalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  criticalCount = 0,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const isTeacher = currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Admin Overview',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      id: 'student-portal' as NavTab,
      label: 'My Student Portal',
      icon: GraduationCap,
      badge: isStudent ? 'Active' : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      roles: ['admin', 'student'],
    },
    {
      id: 'teacher-portal' as NavTab,
      label: 'Teacher Portal',
      icon: BookOpenCheck,
      badge: isTeacher ? 'Assigned' : undefined,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'attendance' as NavTab,
      label: 'Daily Attendance',
      icon: CalendarCheck,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'students' as NavTab,
      label: 'Students Roster',
      icon: GraduationCap,
      badge: criticalCount > 0 ? `${criticalCount} Alert` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      roles: ['admin', 'teacher'],
    },
    {
      id: 'teachers' as NavTab,
      label: 'Faculty & Teachers',
      icon: Users,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'classes' as NavTab,
      label: 'Classes & Sections',
      icon: School,
      roles: ['admin', 'teacher'],
    },
    {
      id: 'reports' as NavTab,
      label: 'Analytics & Reports',
      icon: BarChart3,
      roles: ['admin', 'teacher'],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Active Role Indicator */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/40">
                {currentUser.role}
              </span>
              {currentUser.department && (
                <span className="text-[10px] text-slate-400 truncate">{currentUser.department}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Core ERP Modules
        </div>

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
          <School className="w-3.5 h-3.5" />
          <span>Springfield SIS</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Academic Year 2025–2026 • Spring Semester
        </p>
      </div>
    </aside>
  );
};