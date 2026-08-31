import React from 'react';
import {
  School,
  LogOut,
} from 'lucide-react';
import { User as UserType } from '../types.js';

interface HeaderProps {
  currentUser: UserType;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
}) => {

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & School Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">EduCore</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  School ERP MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Springfield Academy Management System</p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Info & Logout Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-end space-x-2">
                  <span>{currentUser.name}</span>
                  <span className="capitalize text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-medium">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};