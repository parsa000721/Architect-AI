
import React from 'react';
import { Role } from '../types';
import { SunIcon, MoonIcon, MenuIcon } from './icons/IconComponents';

interface HeaderProps {
  viewName: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  role: Role;
  setRole: (role: Role) => void;
  onMenuClick: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void; bgClass: string;}> = ({ checked, onChange, bgClass }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-800 ${checked ? bgClass : 'bg-secondary-300 dark:bg-secondary-600'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

export const Header: React.FC<HeaderProps> = ({ viewName, isDarkMode, toggleDarkMode, role, setRole, onMenuClick }) => {
  const handleRoleChange = () => {
    setRole(role === Role.ADMIN ? Role.USER : Role.ADMIN);
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="md:hidden mr-4 text-secondary-600 dark:text-secondary-300">
            <MenuIcon />
        </button>
        <h1 className="text-xl font-semibold text-secondary-900 dark:text-white truncate">{viewName}</h1>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400 hidden sm:inline">{Role.USER}</span>
            <ToggleSwitch checked={role === Role.ADMIN} onChange={handleRoleChange} bgClass="bg-primary-600" />
            <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">{Role.ADMIN}</span>
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-300 transition-colors">
            {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
            <span className="sr-only">थीम बदलें</span>
        </button>
      </div>
    </header>
  );
};
