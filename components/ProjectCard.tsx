
import React from 'react';
import { Project } from '../types';
import { TrashIcon, EditIcon, ClockIcon, CheckCircleIcon } from './icons/IconComponents';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onDelete: () => void;
  isAdmin: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onDelete, isAdmin }) => {
  const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusChip = () => {
    switch (project.status) {
      case 'जारी है':
        return <div className="text-xs font-medium text-yellow-800 bg-yellow-100 dark:text-yellow-100 dark:bg-yellow-800/50 px-2 py-1 rounded-full">{project.status}</div>;
      case 'पूर्ण':
        return <div className="text-xs font-medium text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-800/50 px-2 py-1 rounded-full">{project.status}</div>;
      case 'योजना चरण में':
        return <div className="text-xs font-medium text-blue-800 bg-blue-100 dark:text-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded-full">{project.status}</div>;
      default:
        return <div className="text-xs font-medium text-secondary-800 bg-secondary-100 dark:text-secondary-100 dark:bg-secondary-700/50 px-2 py-1 rounded-full">{project.status}</div>;
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border border-transparent dark:hover:border-primary-500">
      <div onClick={onSelect} className="p-5 cursor-pointer flex-grow">
        <h3 className="text-lg font-bold text-secondary-900 dark:text-white truncate">{project.name}</h3>
        <div className="mt-4 flex items-center justify-between">
          {getStatusChip()}
          <div className="flex items-center text-sm text-secondary-500 dark:text-secondary-400">
            {project.status === 'पूर्ण' ? <CheckCircleIcon className="w-4 h-4 mr-1 text-green-500" /> : <ClockIcon className="w-4 h-4 mr-1"/>}
            <span>{daysRemaining > 0 ? `${daysRemaining} दिन शेष` : 'समय समाप्त'}</span>
          </div>
        </div>
      </div>
      <div className="bg-secondary-50 dark:bg-secondary-800/50 p-3 flex items-center justify-end space-x-2 border-t border-secondary-200 dark:border-secondary-700">
        <button className="p-2 rounded-full text-secondary-500 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors" aria-label="एडिट">
          <EditIcon />
        </button>
        {isAdmin && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" aria-label="डिलीट">
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
};
