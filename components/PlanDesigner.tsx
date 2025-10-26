import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GridIcon, ToggleOnIcon, ToggleOffIcon, PointerIcon, BigTrashIcon, RotateCwIcon, ZoomInIcon, ZoomOutIcon, SparklesIcon, UndoIcon, RedoIcon } from './icons/IconComponents';
import { ElementType, CanvasElement } from '../types';

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface InteractionState {
  mode: 'idle' | 'panning' | 'drawing' | 'moving' | 'resizing' | 'rotating';
  startPoint?: { x: number, y: number };
  originalElement?: CanvasElement;
  handle?: Handle;
}

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 15;
const WALL_THICKNESS = 10;
const MIN_ELEMENT_SIZE = 10;

export const elementIcons: Record<ElementType, React.ReactNode> = {
    'दीवार': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2 21V3h20v18H2zM4 19h16V5H4v14z"/></svg>,
    'खिड़की': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4 19h16V5H4v14zM11 17h2V7h-2v10zM6 12h12v-2H6v2z"/></svg>,
    'दरवाज़ा': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 19h8V5H8v14zm2-10h1v1h-1v-1z"/></svg>,
    'कॉलम': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M5 21V3h3v18H5zm11 0V3h3v18h-3z"/></svg>,
    'स्लैब': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-50"><path d="M2 21V3h20v18H2z"/></svg>,
    'सीढ़ियाँ': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M6 18h12V9H6v9zM8 16h8v-2H8v2zM8 13h8v-2H8v2z"/></svg>,
    'बालकनी': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 9v10H4V9h16M21 7H3v14h18V7zM6 11h2v6H6v-6zm5 0h2v6h-2v-6zm5 0h2v6h-2v-6z"/></svg>,
    'स्तंभ': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><circle cx="12" cy="12" r="4"/></svg>,
    'मेहराब': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 21H4V9a8 8 0 0 1 16 0v12z"/></svg>,
    'चिमनी': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16 3h-8v11h8V3zM18 16H6v5h12v-5z"/></svg>,
    'रोशनदान': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 10h4v4h-4zM4 8l8-4 8 4-8 4-8-4z"/></svg>,
    'बाथरूम': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>,
    'किचन': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M18 20V4H6v16h12zM8 18V6h8v12H8zm2-8h4v-2h-4v2zm0 4h4v-2h-4v2z"/></svg>,
    'डाइनिंग टेबल': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M20 10v10H4V10"/><path d="M2 10h20"/><path d="M7 10V4h10v6"/></svg>,
    'बिस्तर': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 9H4v8h16V9zM6 11h3v4H6v-4z"/><path d="M3 7h18v12H3z"/></svg>,
    'अलमारी': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 21V3h12v18H6zm2-2h8V5H8v14zm2-10h1v4h-1v-4zm3 0h1v4h-1v-4z"/></svg>,
    'सोफ़ा': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2 15V8h20v7H2zM4 13h16v-3H4v3z"/></svg>,
    'आरामकुर्सी': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M5 15V8h14v7H5zM7 13h10v-3H7v3z"/></svg>,
    'कॉफ़ी टेबल': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><rect x="4" y="10" width="16" height="4" rx="1"/></svg>,
    'टीवी यूनिट': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 6H3v10h18V6zm-2 8H5V8h14v6z"/><rect x="7" y="18" width="10" height="2" rx="1"/></svg>,
    'बुकशेल्फ़': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M8 3v18h8V3H8zM10 7h4M10 12h4M10 17h4"/></svg>,
    'पौधा': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>,
    'गलीचा': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-30"><path d="M3 5v14h18V5H3zm16 12H5V7h14v10z"/></svg>,
    'लैंप': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M8 2h8l4 8H4l4-8zM9 12h6v9H9v-9z"/></svg>,
    'फूलदान': <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C8.7 2 6 4.7 6 8c0 1.5.5 2.9 1.5 4H6v8h12v-8h-1.5c1-1.1 1.5-2.5 1.5-4 0-3.3-2.7-6-6-6z"/></svg>,
    'दीवार घड़ी': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    'आईना': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="5" y="3" width="14" height="18" rx="2"/></svg>,
};

export const toolboxItems: ElementType[] = [
    'दीवार', 'खिड़की', 'दरवाज़ा', 'कॉलम', 'स्लैब', 'सीढ़ियाँ', 'बालकनी', 'स्तंभ', 'मेहराब', 'चिमनी', 'रोशनदान',
    'बाथरूम', 'किचन', 'डाइनिंग टेबल', 'बिस्तर', 'अलमारी', 'सोफ़ा', 'आरामकुर्सी', 'कॉफ़ी टेबल', 'टीवी यूनिट',
    'बुकशेल्फ़', 'पौधा', 'गलीचा', 'लैंप', 'फूलदान', 'दीवार घड़ी', 'आईना'
];

const ToolButton: React.FC<{ name: ElementType | 'select', activeTool: ElementType | 'select', onSelect: () => void, children?: React.ReactNode }> = ({ name, activeTool, onSelect, children }) => (
    <div 
        className={`bg-secondary-50 dark:bg-secondary-800/50 border rounded-md p-2 text-center text-secondary-700 dark:text-secondary-300 font-medium cursor-pointer transition-all flex flex-col items-center justify-center aspect-square text-xs gap-1
            ${activeTool === name ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-700'}`}
        onClick={onSelect}
        title={name}
    >
        {children || name}
        <span className="truncate w-full">{name}</span>
    </div>
);

interface PlanDesignerProps {
    elements: CanvasElement[];
    setElements: (updater: (prev: CanvasElement[]) => CanvasElement[], skipHistory?: boolean) => void;
    defaultGridVisible: boolean;
    defaultSnappingEnabled: boolean;
    onToggleAiGenerator: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export const PlanDesigner: React.FC<PlanDesignerProps> = ({ elements, setElements: setElementsWithHistory, defaultGridVisible, defaultSnappingEnabled, onToggleAiGenerator, undo, redo, canUndo, canRedo }) => {
    const [view, setView] = useState<ViewState>({ scale: 1.5, offsetX: 0, offsetY: 0 });
    const [isGridVisible, setIsGridVisible] = useState(defaultGridVisible);
    const [isSnappingEnabled, setIsSnappingEnabled] = useState(defaultSnappingEnabled);
    const [activeTool, setActiveTool] = useState<ElementType | 'select'>('select');
    const [interaction, setInteraction] = useState<InteractionState>({ mode: 'idle' });
    const [previewElement, setPreviewElement] = useState<Partial<CanvasElement> | null>(null);
    const [snapPoint, setSnapPoint] = useState<{ x: number, y: number } | null>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [transientElements, setTransientElements] = useState<CanvasElement[]>(elements);
    
    useEffect(() => {
        setTransientElements(elements);
    }, [elements]);

    const canvasRef = useRef<HTMLDivElement>(null);

    const screenToWorld = useCallback((screenX: number, screenY: number): { x: number, y: number } => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvasBounds = canvasRef.current.getBoundingClientRect();
        const worldX = (screenX - canvasBounds.left - view.offsetX) / view.scale;
        const worldY = (screenY - canvasBounds.top - view.offsetY) / view.scale;
        return { x: worldX, y: worldY };
    }, [view]);

    const getSnapPoint = useCallback((x: number, y: number) => {
        if (!isSnappingEnabled) return { x, y };
        const threshold = SNAP_THRESHOLD / view.scale;
        let bestSnap = { x: Math.round(x / GRID_SIZE) * GRID_SIZE, y: Math.round(y / GRID_SIZE) * GRID_SIZE };
        let minDistance = Math.sqrt(Math.pow(x - bestSnap.x, 2) + Math.pow(y - bestSnap.y, 2));

        const checkPoint = (px: number, py: number) => {
            const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
            if (distance < threshold && distance < minDistance) {
                minDistance = distance;
                bestSnap = { x: px, y: py };
            }
        };
        transientElements.forEach(el => {
            if (el.id === selectedElementId) return;
            checkPoint(el.x, el.y);
            checkPoint(el.x + el.width, el.y);
            checkPoint(el.x, el.y + el.height);
            checkPoint(el.x + el.width, el.y + el.height);
        });
        return bestSnap;
    }, [transientElements, isSnappingEnabled, view.scale, selectedElementId]);

    const createNewElement = (type: ElementType, x: number, y: number, width?: number, height?: number, rotation?: number): CanvasElement => {
        const base = { id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, type, x, y, scale: 1, rotation: rotation || 0, width: 100, height: 100 };
        const center = (val: number, size: number) => val - size / 2;
        
        switch (type) {
            case 'दीवार': return { ...base, width: width || 200, height: height || WALL_THICKNESS };
            case 'खिड़की': return { ...base, width: 80, height: WALL_THICKNESS, x: center(x,80), y: center(y,WALL_THICKNESS) };
            case 'दरवाज़ा': return { ...base, width: 90, height: WALL_THICKNESS, x: center(x,90), y: center(y,WALL_THICKNESS) };
            case 'कॉलम': return { ...base, width: 30, height: 30, x: center(x,30), y: center(y,30) };
            case 'स्लैब': return { ...base, width: 300, height: 200, x: center(x,300), y: center(y,200) };
            case 'सीढ़ियाँ': return { ...base, width: 100, height: 220, x: center(x,100), y: center(y,220) };
            case 'बालकनी': return { ...base, width: 300, height: 120, x: center(x,300), y: center(y,120) };
            case 'स्तंभ': return { ...base, width: 40, height: 40, x: center(x,40), y: center(y,40) };
            case 'मेहराब': return { ...base, width: 120, height: WALL_THICKNESS, x: center(x,120), y: center(y,WALL_THICKNESS) };
            case 'चिमनी': return { ...base, width: 60, height: 50, x: center(x,60), y: center(y,50) };
            case 'रोशनदान': return { ...base, width: 100, height: 100, x: center(x,100), y: center(y,100) };
            case 'बाथरूम': return { ...base, width: 180, height: 250, x: center(x,180), y: center(y,250) };
            case 'किचन': return { ...base, width: 250, height: 60, x: center(x,250), y: center(y,60) };
            case 'डाइनिंग टेबल': return { ...base, width: 180, height: 100, x: center(x,180), y: center(y,100) };
            case 'बिस्तर': return { ...base, width: 160, height: 200, x: center(x,160), y: center(y,200) };
            case 'अलमारी': return { ...base, width: 150, height: 60, x: center(x,150), y: center(y,60) };
            case 'सोफ़ा': return { ...base, width: 220, height: 90, x: center(x,220), y: center(y,90) };
            case 'आरामकुर्सी': return { ...base, width: 80, height: 90, x: center(x,80), y: center(y,90) };
            case 'कॉफ़ी टेबल': return { ...base, width: 100, height: 60, x: center(x,100), y: center(y,60) };
            case 'टीवी यूनिट': return { ...base, width: 180, height: 50, x: center(x,180), y: center(y,50) };
            case 'बुकशेल्फ़': return { ...base, width: 100, height: 40, x: center(x,100), y: center(y,40) };
            case 'पौधा': return { ...base, width: 50, height: 50, x: center(x,50), y: center(y,50) };
            case 'गलीचा': return { ...base, width: 200, height: 300, x: center(x,200), y: center(y,300) };
            case 'लैंप': return { ...base, width: 40, height: 40, x: center(x,40), y: center(y,40) };
            case 'फूलदान': return { ...base, width: 25, height: 25, x: center(x,25), y: center(y,25) };
            case 'दीवार घड़ी': return { ...base, width: 30, height: 5, x: center(x,30), y: center(y,5) };
            case 'आईना': return { ...base, width: 60, height: 5, x: center(x,60), y: center(y,5) };
            default: return { ...base, x: center(x,100), y: center(y,100) };
        }
    };
    
    const handleToolSelect = (tool: ElementType | 'select') => { setActiveTool(tool); setInteraction({mode: 'idle'}); setPreviewElement(null); };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        const snappedPos = getSnapPoint(worldPos.x, worldPos.y);

        if (e.target !== e.currentTarget && e.target !== canvasRef.current?.firstChild) return; 

        if (activeTool !== 'select') {
             if (activeTool === 'दीवार') {
                setInteraction({ mode: 'drawing', startPoint: snappedPos });
            } else {
                const newElement = createNewElement(activeTool, snappedPos.x, snappedPos.y);
                setElementsWithHistory(prev => [...prev, newElement]);
                setSelectedElementId(newElement.id);
                handleToolSelect('select');
            }
        } else if (e.button === 1 || e.shiftKey) { 
            e.preventDefault();
            setInteraction({ mode: 'panning', startPoint: { x: e.clientX - view.offsetX, y: e.clientY - view.offsetY }});
        } else {
            setSelectedElementId(null);
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const currentPos = screenToWorld(e.clientX, e.clientY);
        const snappedPos = getSnapPoint(currentPos.x, currentPos.y);
        setSnapPoint(snappedPos);

        if (interaction.mode === 'panning') {
            setView(v => ({ ...v, offsetX: e.clientX - interaction.startPoint!.x, offsetY: e.clientY - interaction.startPoint!.y }));
            return;
        }

        switch (interaction.mode) {
            case 'moving': {
                const { startPoint, originalElement } = interaction;
                if (!startPoint || !originalElement) return;
                let finalX = originalElement.x + (currentPos.x - startPoint.x);
                let finalY = originalElement.y + (currentPos.y - startPoint.y);
                 if (isSnappingEnabled) {
                    const snapped = getSnapPoint(finalX, finalY);
                    finalX = snapped.x;
                    finalY = snapped.y;
                }
                setTransientElements(els => els.map(el => el.id === selectedElementId ? { ...el, x: finalX, y: finalY } : el));
                break;
            }
            case 'drawing': {
                const { startPoint } = interaction;
                if (!startPoint) return;
                const dx = snappedPos.x - startPoint.x;
                const dy = snappedPos.y - startPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                setPreviewElement({ x: startPoint.x, y: startPoint.y, width: length, height: WALL_THICKNESS, rotation: angle, type: 'दीवार' });
                break;
            }
            case 'rotating': {
                const { originalElement } = interaction;
                if(!originalElement) return;
                const centerX = originalElement.x + originalElement.width / 2;
                const centerY = originalElement.y + originalElement.height / 2;
                const angle = Math.atan2(currentPos.y - centerY, currentPos.x - centerX) * (180 / Math.PI);
                const newRotation = Math.round((angle + 90) / (isSnappingEnabled ? 15 : 1)) * (isSnappingEnabled ? 15 : 1);
                setTransientElements(els => els.map(el => el.id === selectedElementId ? { ...el, rotation: newRotation } : el));
                break;
            }
             case 'resizing': {
                const { startPoint, originalElement, handle } = interaction;
                if (!startPoint || !originalElement || !handle) return;
                
                const rad = (originalElement.rotation || 0) * Math.PI / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);

                const dx = currentPos.x - startPoint.x;
                const dy = currentPos.y - startPoint.y;
                
                let dxLocal = dx * cos + dy * sin;
                let dyLocal = -dx * sin + dy * cos;

                let newX = originalElement.x;
                let newY = originalElement.y;
                let newW = originalElement.width;
                let newH = originalElement.height;

                if (handle.includes('e')) newW = Math.max(MIN_ELEMENT_SIZE, originalElement.width + dxLocal);
                if (handle.includes('w')) {
                    newW = Math.max(MIN_ELEMENT_SIZE, originalElement.width - dxLocal);
                    newX += dxLocal * cos;
                    newY += dxLocal * sin;
                }
                if (handle.includes('s')) newH = Math.max(MIN_ELEMENT_SIZE, originalElement.height + dyLocal);
                if (handle.includes('n')) {
                    newH = Math.max(MIN_ELEMENT_SIZE, originalElement.height - dyLocal);
                    newX -= dyLocal * sin;
                    newY += dyLocal * cos;
                }

                setTransientElements(els => els.map(el => el.id === selectedElementId ? { ...el, x: newX, y: newY, width: newW, height: newH } : el));
                break;
            }
        }
    };
    
    const handleMouseUp = () => {
        if (interaction.mode === 'drawing' && previewElement?.width && previewElement.width > GRID_SIZE) {
            const { x, y, width, height, rotation } = previewElement;
            const newWall = createNewElement('दीवार', x!, y!, width, height, rotation);
            setElementsWithHistory(prev => [...prev, newWall]);
            setSelectedElementId(newWall.id);
        } else if (['moving', 'resizing', 'rotating'].includes(interaction.mode)) {
            setElementsWithHistory(() => transientElements, false);
        }
        setInteraction({ mode: 'idle' });
        setPreviewElement(null);
    };

    const handleInteractionStart = (mode: InteractionState['mode'], e: React.MouseEvent, element: CanvasElement, handle?: Handle) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedElementId(element.id);
        const startPoint = screenToWorld(e.clientX, e.clientY);
        setInteraction({ mode, startPoint, originalElement: element, handle });
    };

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        e.preventDefault();
        const scaleAmount = -e.deltaY * 0.001;
        const newScale = Math.max(0.2, Math.min(3, view.scale + scaleAmount));
        const rect = canvasRef.current!.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newOffsetX = mouseX - (mouseX - view.offsetX) * (newScale / view.scale);
        const newOffsetY = mouseY - (mouseY - view.offsetY) * (newScale / view.scale);
        setView({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
    };

    const updateSelectedElement = (props: Partial<CanvasElement>) => {
        if (!selectedElementId) return;
        setElementsWithHistory(els => els.map(el => el.id === selectedElementId ? { ...el, ...props } : el));
    };

    const deleteSelectedElement = () => { if(selectedElementId) setElementsWithHistory(prev => prev.filter(el => el.id !== selectedElementId)); setSelectedElementId(null); };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { handleToolSelect('select'); setSelectedElementId(null); }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) { deleteSelectedElement(); }
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); undo(); }
                if (e.key === 'y') { e.preventDefault(); redo(); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId, undo, redo]);
    
    const elementsToRender = previewElement ? [...transientElements, previewElement as CanvasElement] : transientElements;
    const selectedElement = transientElements.find(el => el.id === selectedElementId);

    const handles: Handle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    const getHandleCursor = (handle: Handle) => {
        const angle = (selectedElement?.rotation || 0) % 360;
        const rotatedAngle = (angle + (
            handle === 'n' ? 0 : handle === 'ne' ? 45 : handle === 'e' ? 90 :
            handle === 'se' ? 135 : handle === 's' ? 180 : handle === 'sw' ? 225 :
            handle === 'w' ? 270 : 315 // nw
        )) % 360;
        if (rotatedAngle >= 22.5 && rotatedAngle < 67.5) return 'nesw-resize';
        if (rotatedAngle >= 67.5 && rotatedAngle < 112.5) return 'ew-resize';
        if (rotatedAngle >= 112.5 && rotatedAngle < 157.5) return 'nwse-resize';
        if (rotatedAngle >= 157.5 && rotatedAngle < 202.5) return 'ns-resize';
        if (rotatedAngle >= 202.5 && rotatedAngle < 247.5) return 'nesw-resize';
        if (rotatedAngle >= 247.5 && rotatedAngle < 292.5) return 'ew-resize';
        if (rotatedAngle >= 292.5 && rotatedAngle < 337.5) return 'nwse-resize';
        return 'ns-resize';
    };

    return (
        <div className="flex h-full gap-4">
            {/* Toolbox */}
            <div className="w-64 flex-shrink-0 bg-secondary-50 dark:bg-secondary-900/50 p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 flex flex-col gap-2">
                <div 
                    className={`bg-secondary-100 dark:bg-secondary-800/50 border rounded-md p-2 text-center text-secondary-800 dark:text-secondary-200 font-medium cursor-pointer transition-colors flex items-center justify-center
                        ${activeTool === 'select' ? 'border-primary-500 ring-2 ring-primary-500' : 'border-secondary-300 dark:border-secondary-700 hover:border-primary-400'}`}
                    onClick={() => handleToolSelect('select')}
                    title="select"
                >
                    <PointerIcon /> <span className="ml-2">चयन करें</span>
                </div>
                <hr className="my-2 border-secondary-300 dark:border-secondary-700"/>
                <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {toolboxItems.map(tool => <ToolButton key={tool} name={tool} activeTool={activeTool} onSelect={() => handleToolSelect(tool)}>{elementIcons[tool]}</ToolButton>)}
                </div>
            </div>

            <div className="flex-1 flex flex-col relative">
                <div 
                    ref={canvasRef}
                    className={`flex-1 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 relative overflow-hidden ${isGridVisible ? 'bg-grid' : 'bg-secondary-100 dark:bg-secondary-900'}`}
                    style={{ cursor: activeTool === 'select' ? (interaction.mode === 'moving' ? 'grabbing' : 'default') : 'crosshair' }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                >
                    <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${view.offsetX}px, ${view.offsetY}px) scale(${view.scale})` }}>
                        {elementsToRender.map(el => {
                            const isSelected = el.id === selectedElementId;
                            return (
                                <div
                                    key={el.id}
                                    className={`absolute transition-colors ${el.id === previewElement?.id ? 'opacity-50' : ''} ${activeTool === 'select' ? 'cursor-grab' : 'cursor-default'}`}
                                    style={{
                                        left: el.x,
                                        top: el.y,
                                        width: el.width,
                                        height: el.height,
                                        transform: `rotate(${el.rotation || 0}deg)`,
                                        transformOrigin: 'center center',
                                    }}
                                    onMouseDown={(e) => { if(activeTool === 'select') handleInteractionStart('moving', e, el) }}
                                >
                                    <div className={`w-full h-full flex items-center justify-center text-xs border select-none font-medium ${isSelected ? 'bg-[#f0f8ff] dark:bg-sky-900/60 border-primary-400 dark:border-primary-600 text-secondary-900 dark:text-secondary-100' : 'bg-primary-200/80 dark:bg-primary-800/60 border-primary-400/80 dark:border-primary-600/80 text-secondary-900 dark:text-secondary-100'}`}>
                                       {el.type !== 'गलीचा' && el.type !== 'रोशनदान' && el.type }
                                    </div>
                                </div>
                            );
                        })}
                        {selectedElement && (
                            <div className="absolute pointer-events-none" style={{
                                left: selectedElement.x, top: selectedElement.y,
                                width: selectedElement.width, height: selectedElement.height,
                                transform: `rotate(${selectedElement.rotation || 0}deg)`,
                                transformOrigin: 'center center',
                                outline: `2px solid #3b82f6`,
                                outlineOffset: '2px'
                            }}>
                                {handles.map(h => 
                                    <div key={h} className="absolute w-3 h-3 bg-white border border-primary-600 rounded-full pointer-events-auto transition-transform hover:scale-125"
                                         style={{ 
                                            top: h.includes('n') ? -6 : h.includes('s') ? 'auto' : '50%',
                                            bottom: h.includes('s') ? -6 : 'auto',
                                            left: h.includes('w') ? -6 : h.includes('e') ? 'auto' : '50%',
                                            right: h.includes('e') ? -6 : 'auto',
                                            marginTop: h.includes('n') || h.includes('s') ? 0 : -6,
                                            marginLeft: h.includes('w') || h.includes('e') ? 0 : -6,
                                            cursor: getHandleCursor(h),
                                        }}
                                        onMouseDown={e => handleInteractionStart('resizing', e, selectedElement, h)}
                                    />
                                )}
                                <div className="absolute -top-8 left-1/2 -ml-2.5 w-5 h-5 bg-white border border-primary-600 rounded-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                                    onMouseDown={e => handleInteractionStart('rotating', e, selectedElement)}
                                > <RotateCwIcon className="w-3 h-3 text-primary-600"/> </div>
                                 <div className="absolute -bottom-8 left-1/2 -ml-2.5 w-5 h-5 bg-red-500 border border-red-700 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer transition-transform hover:scale-110"
                                     onClick={deleteSelectedElement}
                                     onMouseDown={e => e.stopPropagation()}
                                > <BigTrashIcon className="w-3 h-3 text-white"/> </div>
                            </div>
                        )}
                        {snapPoint && interaction.mode !== 'idle' && <div className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-cyan-400 ring-2 ring-cyan-400/80" style={{ left: snapPoint.x, top: snapPoint.y }} />}
                    </div>
                </div>
                 {/* Floating Controls */}
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-sm p-2 rounded-lg shadow-md border border-secondary-200 dark:border-secondary-700">
                    <button onClick={onToggleAiGenerator} title="AI जेनरेटर" className="p-1 rounded text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/50"><SparklesIcon/></button>
                    <div className="h-6 w-px bg-secondary-300 dark:bg-secondary-600 mx-1"></div>
                    <button onClick={undo} disabled={!canUndo} title="पूर्ववत करें (Ctrl+Z)" className="p-1 rounded text-secondary-600 dark:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed"><UndoIcon/></button>
                    <button onClick={redo} disabled={!canRedo} title="पुनः करें (Ctrl+Y)" className="p-1 rounded text-secondary-600 dark:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed"><RedoIcon/></button>
                    <div className="h-6 w-px bg-secondary-300 dark:bg-secondary-600 mx-1"></div>
                    <button onClick={() => setIsGridVisible(v => !v)} title="ग्रिड टॉगल करें" className={`p-1 rounded ${isGridVisible ? 'text-primary-500 bg-primary-100 dark:bg-primary-900/50' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200'}`}><GridIcon/></button>
                    <button onClick={() => setIsSnappingEnabled(v => !v)} title="स्नैपिंग टॉगल करें" className={`p-1 rounded ${isSnappingEnabled ? 'text-primary-500 bg-primary-100 dark:bg-primary-900/50' : 'text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200'}`}>{isSnappingEnabled ? <ToggleOnIcon/> : <ToggleOffIcon/>}</button>
                    <div className="h-6 w-px bg-secondary-300 dark:bg-secondary-600 mx-1"></div>
                    <button onClick={e => handleWheel({ deltaY: 100, preventDefault: () => {} } as React.WheelEvent<HTMLDivElement>)} className="p-1 rounded text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"><ZoomOutIcon/></button>
                    <span className="text-sm font-mono text-secondary-700 dark:text-secondary-300 w-10 text-center">{(view.scale * 100).toFixed(0)}%</span>
                    <button onClick={e => handleWheel({ deltaY: -100, preventDefault: () => {} } as React.WheelEvent<HTMLDivElement>)} className="p-1 rounded text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200"><ZoomInIcon/></button>
                </div>
            </div>

            {selectedElement && (
                <div className="w-64 flex-shrink-0 bg-secondary-50 dark:bg-secondary-900/50 p-4 rounded-lg border border-secondary-200 dark:border-secondary-700 flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white border-b pb-2 border-secondary-300 dark:border-secondary-700">गुण</h3>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">चौड़ाई</label>
                        <input type="number" value={Math.round(selectedElement.width)} onChange={e => updateSelectedElement({ width: Number(e.target.value) })} className="w-full p-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md text-sm"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">ऊंचाई</label>
                        <input type="number" value={Math.round(selectedElement.height)} onChange={e => updateSelectedElement({ height: Number(e.target.value) })} className="w-full p-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md text-sm"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-secondary-600 dark:text-secondary-400">रोटेशन (°)</label>
                        <input type="number" value={Math.round(selectedElement.rotation || 0)} onChange={e => updateSelectedElement({ rotation: Number(e.target.value) })} className="w-full p-2 bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 rounded-md text-sm"/>
                    </div>
                </div>
            )}

            <style>{`.bg-grid { background-size: ${GRID_SIZE * view.scale}px ${GRID_SIZE * view.scale}px; background-position: ${view.offsetX}px ${view.offsetY}px; background-image: linear-gradient(to right, rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.2) 1px, transparent 1px); } .dark .bg-grid { background-image: linear-gradient(to right, rgba(71, 85, 105, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(71, 85, 105, 0.5) 1px, transparent 1px); }`}</style>
        </div>
    );
};