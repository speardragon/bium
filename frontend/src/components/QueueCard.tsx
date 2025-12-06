import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Queue, Task } from '../types';
import { calculateDuration, formatDuration, calculateFillPercentage, getFillStatus, getFillColor } from '../utils';
import { useStore } from '../store/useStore';

interface QueueCardProps {
  queue: Queue;
  date: string;
  tasks: Task[];
}

export function QueueCard({ queue, date, tasks }: QueueCardProps) {
  const { unassignTask } = useStore();
  const { isOver, setNodeRef } = useDroppable({
    id: `${queue.id}-${date}`,
    data: { queue, date }
  });

  // Calculate queue capacity and usage
  const totalMinutes = calculateDuration(queue.startTime, queue.endTime);
  const usedMinutes = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const bufferMinutes = Math.max(0, totalMinutes - usedMinutes);
  const fillPercentage = calculateFillPercentage(usedMinutes, totalMinutes);
  const fillStatus = getFillStatus(fillPercentage);
  const fillColor = getFillColor(fillStatus);
  const isOverfilled = fillPercentage > 100;

  // Format time display
  const timeDisplay = `${queue.startTime.replace(':00', '')} - ${queue.endTime.replace(':00', '')}`;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative rounded-lg border-2 transition-all duration-200 overflow-hidden
        ${isOverfilled ? 'border-dashed border-red-400 overflow-warning' : 'border-dashed border-gray-300'}
        ${isOver ? 'drop-target-active border-blue-400 border-solid' : ''}
        ${tasks.length === 0 ? 'min-h-[140px]' : 'min-h-[100px]'}
      `}
      style={{ backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }}
    >
      {/* Water Level Background */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out water-fill"
        style={{
          height: `${Math.min(fillPercentage, 100)}%`,
          backgroundColor: fillColor,
          opacity: 0.15,
          '--fill-level': `${Math.min(fillPercentage, 100)}%`
        } as React.CSSProperties}
      />

      {/* Buffer Pattern (empty space) */}
      {bufferMinutes > 0 && !isOverfilled && (
        <div
          className="absolute top-0 left-0 right-0 buffer-pattern"
          style={{
            height: `${100 - fillPercentage}%`,
            opacity: 0.5
          }}
        />
      )}

      {/* Queue Header */}
      <div className="relative z-10 p-2 border-b border-gray-200 bg-white/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tasks.length === 0 && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-xs font-medium text-gray-600">{timeDisplay}</span>
          </div>
          {/* Fill percentage indicator */}
          <div className="flex items-center gap-1">
            <span className={`text-xs font-bold ${
              fillStatus === 'safe' ? 'text-blue-600' :
              fillStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
            }`}>
              {fillPercentage}%
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">{queue.title}</span>
          <span className="text-xs text-gray-500">
            ({formatDuration(usedMinutes)} / {formatDuration(totalMinutes)})
          </span>
        </div>
      </div>

      {/* Tasks in Queue */}
      <div className="relative z-10 p-2 space-y-1">
        {tasks.map((task, index) => {
          const isOverflowing = index === tasks.length - 1 && isOverfilled;
          return (
            <div
              key={task.id}
              onClick={() => unassignTask(task.id)}
              className={`
                px-2 py-1.5 rounded text-xs font-medium cursor-pointer
                transition-all hover:opacity-80
                ${isOverflowing ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-white text-gray-700 border border-gray-200'}
              `}
              style={{
                backgroundColor: isOverflowing ? undefined : `${queue.color}20`,
                borderColor: isOverflowing ? undefined : `${queue.color}40`
              }}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{task.title}</span>
                <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                  isOverflowing ? 'bg-red-200 text-red-700' : 'bg-white/50'
                }`}>
                  {formatDuration(task.durationMinutes)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">{queue.title}</span>
            <span className="text-xs">({formatDuration(totalMinutes)} Capacity)</span>
          </div>
        )}

        {/* Buffer indicator */}
        {bufferMinutes > 0 && tasks.length > 0 && (
          <div className="mt-2 px-2 py-1 rounded bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-500 text-center">
            Buffer ({formatDuration(bufferMinutes)})
          </div>
        )}
      </div>

      {/* Overflow Warning */}
      {isOverfilled && (
        <div className="absolute top-1 right-1 z-20 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          OVER Capacity! (-{formatDuration(usedMinutes - totalMinutes)})
        </div>
      )}
    </div>
  );
}
