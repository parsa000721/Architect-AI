import React from 'react';
import { DashboardIcon, SettingsIcon, LayersIcon } from './icons/IconComponents';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onDashboardClick: () => void;
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, onDashboardClick, onSettingsClick }) => {
  const sidebarClasses = `
    fixed inset-y-0 left-0 bg-white dark:bg-secondary-800 shadow-lg 
    transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:relative md:translate-x-0 transition-transform duration-300 ease-in-out 
    z-30 w-64 flex flex-col
  `;
  
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDashboardClick();
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSettingsClick();
  };

  return (
    <>
      <div className={sidebarClasses}>
        <div className="flex items-center justify-center h-20 border-b border-secondary-200 dark:border-secondary-700">
            <LayersIcon className="w-8 h-8 text-primary-500"/>
            <h1 className="text-2xl font-bold ml-3 text-secondary-900 dark:text-white">आर्किटेक्ट AI</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" onClick={handleDashboardClick} className="flex items-center px-4 py-3 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors">
                <DashboardIcon className="w-5 h-5"/>
                <span className="ml-4 font-medium">डैशबोर्ड</span>
            </a>
            <a href="#" onClick={handleSettingsClick} className="flex items-center px-4 py-3 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-secondary-700 rounded-lg transition-colors">
                <SettingsIcon className="w-5 h-5"/>
                <span className="ml-4 font-medium">सेटिंग्स</span>
            </a>
        </nav>
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <p className="text-xs text-center text-secondary-500">&copy; 2024 आर्किटेक्ट AI</p>
        </div>
      </div>
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
    </>
  );
};