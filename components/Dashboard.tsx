
import React, { useState } from 'react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';
import { PlusIcon } from './icons/IconComponents';

interface DashboardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onCreateNewProject: () => void;
  isAdmin: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onSelectProject, onDeleteProject, onCreateNewProject, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">प्रोजेक्ट्स</h2>
          <p className="text-secondary-500 mt-1">अपने सभी प्रोजेक्ट्स को यहाँ प्रबंधित करें।</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="प्रोजेक्ट खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <button
            onClick={onCreateNewProject}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 transition-colors"
          >
            <PlusIcon className="w-5 h-5"/>
            <span className="hidden sm:inline">नया प्रोजेक्ट</span>
          </button>
        </div>
      </div>
      
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => onSelectProject(project)}
              onDelete={() => onDeleteProject(project.id)}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-secondary-800 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700">
            <h3 className="text-xl font-semibold text-secondary-700 dark:text-secondary-300">कोई प्रोजेक्ट नहीं मिला।</h3>
            <p className="text-secondary-500 mt-2">एक नया प्रोजेक्ट बनाकर शुरू करें।</p>
        </div>
      )}
    </div>
  );
};
