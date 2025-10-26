import React, { useState, useEffect, useCallback } from 'react';
import { Project, CanvasElement, AppSettings } from '../types';
import { PlanDesigner } from './PlanDesigner';
import { ModelViewer } from './ModelViewer';
import { MaterialEstimator } from './MaterialEstimator';
import { BudgetCalculator } from './BudgetCalculator';
import { AILayoutGenerator } from './AILayoutGenerator';
import { ChevronLeftIcon, RulerIcon, CubeIcon, LayersIcon, CalculatorIcon, SaveIcon } from './icons/IconComponents';

interface ProjectViewProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onGoBack: () => void;
  isAdmin: boolean;
  designerSettings: AppSettings['designer'];
}

type Tab = 'designer' | 'viewer' | 'estimator' | 'budget';

const useHistoryState = <T,>(initialState: T): [T, (newState: T | ((prevState: T) => T), skipHistory?: boolean) => void, () => void, () => void, boolean, boolean, (history: T[]) => void] => {
    const [history, setHistory] = useState<T[]>([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const setState = useCallback((newState: T | ((prevState: T) => T), skipHistory = false) => {
        const value = typeof newState === 'function' ? (newState as (prevState: T) => T)(history[currentIndex]) : newState;
        
        if (skipHistory) {
             const newHistory = [...history];
             newHistory[currentIndex] = value;
             setHistory(newHistory);
        } else {
            const newHistory = history.slice(0, currentIndex + 1);
            newHistory.push(value);
            setHistory(newHistory);
            setCurrentIndex(newHistory.length - 1);
        }
    }, [currentIndex, history]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }, [currentIndex, history]);

    const state = history[currentIndex];
    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    return [state, setState, undo, redo, canUndo, canRedo, setHistory];
};


const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            isActive
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const ProjectView: React.FC<ProjectViewProps> = ({ project, onUpdateProject, onGoBack, isAdmin, designerSettings }) => {
    const [activeTab, setActiveTab] = useState<Tab>('designer');
    const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);

    const getInitialElements = useCallback((): CanvasElement[] => {
        try {
            const savedPlan = localStorage.getItem(`project_${project.id}_plan`);
            if (savedPlan) {
                return JSON.parse(savedPlan);
            }
        } catch (error) {
            console.error("Failed to parse saved plan:", error);
        }
        return [
            { id: 'el_wall_1', type: 'दीवार', x: 50, y: 50, width: 400, height: 10, scale: 1, rotation: 0 },
            { id: 'el_wall_2', type: 'दीवार', x: 50, y: 350, width: 400, height: 10, scale: 1, rotation: 0 },
            { id: 'el_wall_3', type: 'दीवार', x: 450, y: 50, width: 10, height: 310, scale: 1, rotation: 0 },
            { id: 'el_wall_4', type: 'दीवार', x: 50, y: 50, width: 10, height: 310, scale: 1, rotation: 0 },
            { id: `el_${Date.now()}_win`, type: 'खिड़की', x: 100, y: 100, width: 80, height: 10, scale: 1, rotation: 0 },
            { id: `el_${Date.now()}_door`, type: 'दरवाज़ा', x: 200, y: 150, width: 90, height: 10, scale: 1, rotation: 0 },
        ];
    }, [project.id]);

    const [elements, setElements, undo, redo, canUndo, canRedo, setHistory] = useHistoryState<CanvasElement[]>(getInitialElements());
    
    useEffect(() => {
        // Load data when project changes
        const initialElements = getInitialElements();
        setHistory([initialElements]);
    }, [project.id]);

    const handleSaveProject = useCallback(() => {
        try {
            localStorage.setItem(`project_${project.id}_plan`, JSON.stringify(elements));
            alert('प्रोजेक्ट सहेजा गया!');
        } catch (error) {
            console.error("Failed to save project:", error);
            alert('प्रोजेक्ट सहेजने में विफल।');
        }
    }, [elements, project.id]);

     const handleAiGenerate = (newElements: CanvasElement[]) => {
        if (elements.length > 0 && !window.confirm('यह आपके वर्तमान नक्शे को बदल देगा। क्या आप निश्चित हैं?\n(This will replace your current plan. Are you sure?)')) {
            return;
        }
        setElements(newElements);
        setIsAiGeneratorOpen(false);
    };
  
    const renderContent = () => {
        switch (activeTab) {
            case 'designer':
                return (
                    <>
                        <PlanDesigner 
                            elements={elements} 
                            setElements={setElements} 
                            defaultGridVisible={designerSettings.defaultGridVisible}
                            defaultSnappingEnabled={designerSettings.defaultSnappingEnabled}
                            onToggleAiGenerator={() => setIsAiGeneratorOpen(true)}
                            undo={undo}
                            redo={redo}
                            canUndo={canUndo}
                            canRedo={canRedo}
                        />
                        {isAiGeneratorOpen && (
                            <AILayoutGenerator
                                onGenerate={handleAiGenerate}
                                onClose={() => setIsAiGeneratorOpen(false)}
                            />
                        )}
                    </>
                );
            case 'viewer':
                return <ModelViewer elements={elements} />;
            case 'estimator':
                return <MaterialEstimator />;
            case 'budget':
                return <BudgetCalculator />;
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in flex flex-col h-full max-h-[calc(100vh-6rem)]">
            <div className="flex-shrink-0">
                <button onClick={onGoBack} className="flex items-center gap-2 mb-4 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>सभी प्रोजेक्ट्स पर वापस जाएं</span>
                </button>
                <div className="bg-white dark:bg-secondary-800 rounded-t-lg shadow-md p-4 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-secondary-900 dark:text-white truncate">{project.name}</h2>
                     <button
                        onClick={handleSaveProject}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 transition-colors"
                        title="प्रोजेक्ट सहेजें"
                    >
                        <SaveIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">प्रोजेक्ट सहेजें</span>
                    </button>
                </div>
            </div>

            <div className="flex-shrink-0 bg-white dark:bg-secondary-800 flex items-center border-b border-secondary-200 dark:border-secondary-700 overflow-x-auto">
                <TabButton label="नक्शा डिज़ाइनर" isActive={activeTab === 'designer'} onClick={() => setActiveTab('designer')} icon={<RulerIcon />} />
                <TabButton label="मॉडल व्यूअर" isActive={activeTab === 'viewer'} onClick={() => setActiveTab('viewer')} icon={<CubeIcon />} />
                <TabButton label="सामग्री अनुमानक" isActive={activeTab === 'estimator'} onClick={() => setActiveTab('estimator')} icon={<LayersIcon />} />
                <TabButton label="बजट कैलकुलेटर" isActive={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<CalculatorIcon />} />
            </div>

            <div className="flex-grow overflow-hidden bg-white dark:bg-secondary-800 rounded-b-lg shadow-md">
                <div className="h-full overflow-auto p-4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};