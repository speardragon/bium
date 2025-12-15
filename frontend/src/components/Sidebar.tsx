import { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

interface SidebarProps {
  children: ReactNode;
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 500;
const COLLAPSED_WIDTH = 0;

export function Sidebar({ children }: SidebarProps) {
  const { sidebarWidth, sidebarCollapsed, setSidebarWidth, setSidebarCollapsed } = useStore();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth = e.clientX - sidebarRef.current.getBoundingClientRect().left;
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing, setSidebarWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="relative flex h-full">
      {/* Sidebar Content */}
      <div
        ref={sidebarRef}
        className={`
          relative flex flex-col bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out overflow-hidden
          ${isResizing ? 'transition-none' : ''}
        `}
        style={{ 
          width: sidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth,
          minWidth: sidebarCollapsed ? COLLAPSED_WIDTH : MIN_WIDTH,
        }}
      >
        {!sidebarCollapsed && (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {!sidebarCollapsed && (
        <div
          className={`
            absolute top-0 bottom-0 w-1 cursor-col-resize z-10
            hover:bg-blue-500 transition-colors
            ${isResizing ? 'bg-blue-500' : 'bg-transparent'}
          `}
          style={{ right: 0 }}
          onMouseDown={startResizing}
        />
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className={`
          absolute top-3 z-20 p-1.5 rounded-full bg-white border border-gray-200 
          shadow-sm hover:bg-gray-50 hover:shadow transition-all
          ${sidebarCollapsed ? 'left-2' : '-right-3'}
        `}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}
