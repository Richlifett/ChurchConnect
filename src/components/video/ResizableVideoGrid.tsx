import React, { useState, useRef, useEffect } from 'react';
import { VideoGrid } from './VideoGrid';

interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  stream?: MediaStream;
}

interface ResizableVideoGridProps {
  viewMode: 'grid' | 'speaker';
  participants: Participant[];
  localStream?: MediaStream;
  isVerseSharing: boolean;
}

export function ResizableVideoGrid({ 
  viewMode, 
  participants, 
  localStream, 
  isVerseSharing 
}: ResizableVideoGridProps) {
  const [gridSize, setGridSize] = useState({ width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isVerseSharing) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - gridSize.width,
      y: e.clientY - gridSize.height
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isVerseSharing) return;

    const newWidth = Math.max(200, Math.min(800, e.clientX - dragStart.x));
    const newHeight = Math.max(150, Math.min(600, e.clientY - dragStart.y));

    setGridSize({ width: newWidth, height: newHeight });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (!isVerseSharing) {
    return (
      <VideoGrid 
        viewMode={viewMode} 
        participants={participants} 
        localStream={localStream}
      />
    );
  }

  return (
    <div className="relative h-full">
      {/* Resizable video grid overlay */}
      <div
        ref={containerRef}
        className="absolute bottom-4 right-4 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 z-30"
        style={{
          width: `${gridSize.width}px`,
          height: `${gridSize.height}px`,
          cursor: isDragging ? 'nw-resize' : 'default'
        }}
      >
        {/* Resize handle */}
        <div
          className="absolute top-0 left-0 w-4 h-4 bg-gray-600 cursor-nw-resize hover:bg-gray-500 transition-colors"
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        >
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-gray-400"></div>
        </div>

        {/* Video grid header */}
        <div className="bg-gray-800 px-3 py-2 text-white text-sm font-medium border-b border-gray-600">
          <div className="flex items-center justify-between">
            <span>Video Conference</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300">Live</span>
            </div>
          </div>
        </div>

        {/* Scaled video grid */}
        <div className="h-full" style={{ height: `${gridSize.height - 40}px` }}>
          <div className="transform scale-75 origin-top-left h-full">
            <div style={{ 
              width: `${(gridSize.width / 0.75)}px`, 
              height: `${((gridSize.height - 40) / 0.75)}px` 
            }}>
              <VideoGrid 
                viewMode={viewMode} 
                participants={participants} 
                localStream={localStream}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Resize instructions */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm z-30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span>Drag corner to resize video windows</span>
        </div>
      </div>
    </div>
  );
}