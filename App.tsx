import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectView } from './components/ProjectView';
import { Settings } from './components/Settings';
import { Project, Role, AppSettings } from './types';

type View = 'dashboard' | 'project' | 'settings';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [role, setRole] = useState<Role>(Role.USER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    designer: {
      defaultGridVisible: true,
      defaultSnappingEnabled: true,
    }
  });

  useEffect(() => {
    // Load initial data
    const initialProjects: Project[] = [
      { id: 1, name: 'आवासीय भवन', deadline: '2024-12-31', status: 'जारी है' },
      { id: 2, name: 'व्यावसायिक कार्यालय ब्लॉक', deadline: '2025-03-15', status: 'योजना चरण में' },
      { id: 3, name: 'सामुदायिक केंद्र', deadline: '2024-11-20', status: 'पूर्ण' },
    ];
    setProjects(initialProjects);

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }

    // Load saved settings
    const savedSettings = localStorage.getItem('architectAISettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('architectAISettings', JSON.stringify(settings));
  }, [settings]);


  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('project');
    setIsSidebarOpen(false);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };
  
  const handleDeleteProject = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProject?.id === projectId) {
      setSelectedProject(null);
      setCurrentView('dashboard');
    }
  };

  const createNewProject = () => {
    const newProject: Project = {
        id: Date.now(),
        name: `नया प्रोजेक्ट ${projects.length + 1}`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'शुरू नहीं हुआ',
    };
    setProjects([newProject, ...projects]);
    setSelectedProject(newProject);
    setCurrentView('project');
  };

  const handleGoToDashboard = () => {
    setSelectedProject(null);
    setCurrentView('dashboard');
    setIsSidebarOpen(false);
  };

  const handleGoToSettings = () => {
    setSelectedProject(null);
    setCurrentView('settings');
    setIsSidebarOpen(false);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({...prev, ...newSettings}));
  };

  const currentViewName = (() => {
    switch(currentView) {
      case 'settings': return 'सेटिंग्स';
      case 'project': return selectedProject?.name || 'प्रोजेक्ट';
      case 'dashboard':
      default:
        return 'डैशबोर्ड';
    }
  })();

  const renderMainContent = () => {
    switch(currentView) {
      case 'settings':
        return <Settings 
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />;
      case 'project':
        return selectedProject ? (
          <ProjectView 
            project={selectedProject} 
            onUpdateProject={handleUpdateProject}
            onGoBack={handleGoToDashboard}
            isAdmin={role === Role.ADMIN}
            designerSettings={settings.designer}
          />
        ) : null;
      case 'dashboard':
      default:
        return (
          <Dashboard 
            projects={projects} 
            onSelectProject={handleSelectProject} 
            onDeleteProject={handleDeleteProject}
            onCreateNewProject={createNewProject}
            isAdmin={role === Role.ADMIN}
          />
        );
    }
  };


  return (
    <div className="flex h-screen bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 font-sans">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        onDashboardClick={handleGoToDashboard}
        onSettingsClick={handleGoToSettings} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          viewName={currentViewName} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          role={role} 
          setRole={setRole}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;