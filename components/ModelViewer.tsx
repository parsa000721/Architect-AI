import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CanvasElement, ElementType } from '../types';

interface ModelViewerProps {
    elements: CanvasElement[];
}

const getElementColor = (type: ElementType): string => {
    switch (type) {
        case 'दीवार': return '#c7bca1';
        case 'खिड़की': return '#a6d8de';
        case 'दरवाज़ा': return '#a37c5b';
        case 'कॉलम': return '#8d8d8d';
        case 'स्लैब': return '#bababa';
        case 'सीढ़ियाँ': return '#b0a494';
        case 'बालकनी': return '#dcdcdc';
        case 'स्तंभ': return '#a9a9a9';
        case 'मेहराब': return '#d2b48c';
        case 'चिमनी': return '#a0522d';
        case 'रोशनदान': return '#add8e6';
        case 'बाथरूम': return '#f0f8ff';
        case 'किचन': return '#e0e0e0';
        case 'डाइनिंग टेबल': return '#966F33';
        case 'बिस्तर': return '#8b4513';
        case 'अलमारी': return '#8B5A2B';
        case 'सोफ़ा': return '#696969';
        case 'आरामकुर्सी': return '#808080';
        case 'कॉफ़ी टेबल': return '#A0522D';
        case 'टीवी यूनिट': return '#4a4a4a';
        case 'बुकशेल्फ़': return '#966F33';
        case 'पौधा': return '#228b22';
        case 'गलीचा': return '#d3b8ae';
        case 'लैंप': return '#f0e68c';
        case 'फूलदान': return '#ffe4e1';
        case 'दीवार घड़ी': return '#333333';
        case 'आईना': return '#e1e1e1';
        default: return '#cccccc';
    }
};

export const ModelViewer: React.FC<ModelViewerProps> = ({ elements }) => {
    const [rotation, setRotation] = useState({ x: -45, y: 125 });
    const [zoom, setZoom] = useState(0.7);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    const dragInfo = useRef({ isRotating: false, isPanning: false, lastX: 0, lastY: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.button === 0) {
            dragInfo.current = { ...dragInfo.current, isRotating: true, lastX: e.clientX, lastY: e.clientY };
        } else if (e.button === 2) {
            dragInfo.current = { ...dragInfo.current, isPanning: true, lastX: e.clientX, lastY: e.clientY };
        }
    };
    
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragInfo.current.isRotating && !dragInfo.current.isPanning) return;
        const dx = e.clientX - dragInfo.current.lastX;
        const dy = e.clientY - dragInfo.current.lastY;
        if (dragInfo.current.isRotating) {
            setRotation(prev => ({ x: Math.max(-90, Math.min(0, prev.x - dy * 0.5)), y: prev.y + dx * 0.5 }));
        }
        if (dragInfo.current.isPanning) {
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        }
        dragInfo.current.lastX = e.clientX;
        dragInfo.current.lastY = e.clientY;
    }, []);

    const handleMouseUp = useCallback(() => {
        dragInfo.current = { ...dragInfo.current, isRotating: false, isPanning: false };
    }, []);
    
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        setZoom(prev => Math.max(0.2, Math.min(2.5, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
    };

    const renderElement3D = (el: CanvasElement) => {
        const style = { backgroundColor: getElementColor(el.type) };
        let height = 250;
        let y_offset = 0;

        switch (el.type) {
            case 'दीवार':
            case 'कॉलम':
            case 'स्तंभ':
            case 'चिमनी':
                 height = 250; break;
            case 'दरवाज़ा':
                 height = 210; break;
            case 'खिड़की':
            case 'मेहराब':
                height = 120; y_offset = 90; break;
            case 'स्लैब':
            case 'बालकनी':
                height = 20; break;
            case 'सीढ़ियाँ':
                height = 250; break;
            case 'किचन':
                height = 90; break;
            case 'अलमारी':
            case 'बुकशेल्फ़':
                height = 200; break;
            case 'बाथरूम':
                height = 150; break;
            case 'बिस्तर':
                height = 50; break;
            case 'सोफ़ा':
            case 'आरामकुर्सी':
                height = 70; break;
            case 'डाइनिंग टेबल':
                height = 75; break;
            case 'कॉफ़ी टेबल':
            case 'टीवी यूनिट':
                height = 45; break;
            case 'लैंप':
                 height = 60; break;
            case 'पौधा':
                 height = 80; break;
            case 'गलीचा':
            case 'रोशनदान':
                height = 2; break;
            case 'फूलदान':
                height = 25; break;
            case 'दीवार घड़ी':
            case 'आईना':
                height = 5; y_offset = 150; break;
            default:
                height = 250; break;
        }


        return (
            <div key={el.id} className="absolute" style={{
                width: el.width, height: el.height, top: '50%', left: '50%',
                transform: `translateX(${el.x - el.width/2}px) translateY(${el.y - el.height/2}px) rotateZ(${el.rotation || 0}deg)`,
                transformStyle: 'preserve-3d',
            }}>
                <div className="absolute w-full h-full" style={{ transform: `translate3d(0, 0, ${height / 2 + y_offset}px)`, transformStyle: 'preserve-3d' }}>
                    <div className="absolute border-b border-black/20" style={{ ...style, width: '100%', height, transform: `translateY(${-height / 2}px) translateZ(${el.height / 2}px)` }}></div>
                    <div className="absolute border-b border-black/20" style={{ ...style, width: '100%', height, transform: `translateY(${-height / 2}px) rotateY(180deg) translateZ(${el.height / 2}px)` }}></div>
                    <div className="absolute border-b border-black/20" style={{ ...style, width: el.height, height, transform: `translateY(${-height / 2}px) rotateY(90deg) translateZ(${el.width / 2}px)` }}></div>
                    <div className="absolute border-b border-black/20" style={{ ...style, width: el.height, height, transform: `translateY(${-height / 2}px) rotateY(-90deg) translateZ(${el.width / 2}px)` }}></div>
                    <div className="absolute border-b border-black/20" style={{ ...style, width: '100%', height: el.height, transform: `rotateX(90deg) translateZ(${height / 2}px)` }}></div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg flex flex-col h-full overflow-hidden">
            <div 
                className="flex-grow rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 relative overflow-hidden bg-secondary-100 dark:bg-secondary-900 cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                onContextMenu={(e) => e.preventDefault()}
            >
                <div className="w-full h-full" style={{ perspective: '2000px' }}>
                    <div className="w-full h-full" style={{ 
                        transform: `translateX(${pan.x}px) translateY(${pan.y}px) scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d'
                    }}>
                        <div className="absolute top-1/2 left-1/2 w-[2000px] h-[2000px]" style={{ transform: 'translate(-50%, -50%) rotateX(90deg)', backgroundColor: '#e2e8f0', backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)', backgroundSize: '40px 40px' }}></div>
                        <div className="absolute top-1/2 left-1/2" style={{ transform: `translate(-1000px, -1000px)`, transformStyle: 'preserve-3d' }}>
                            {elements.map(renderElement3D)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};