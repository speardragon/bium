import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { Check, ChevronDown, ChevronUp, GripVertical, Pencil } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Queue, QueueTemplate, Task } from "../types";
import {
  calculateDuration,
  formatDuration,
  calculateFillPercentage,
  getFillStatus,
  getFillColor,
} from "../utils";
import { useStore } from "../store/useStore";
import { QueueEditPopover } from "./QueueEditPopover";

interface QueueCardProps {
  queue: Queue;
  template: QueueTemplate;
  tasks: Task[];
  isEditMode?: boolean;
  isDragging?: boolean;
}

// Base height per hour (in pixels)
const HEIGHT_PER_HOUR = 80;
const HEADER_HEIGHT = 60;
const EDIT_MODE_HEIGHT = 80;

export function QueueCard({ queue, template, tasks, isEditMode = false, isDragging = false }: QueueCardProps) {
  const { t } = useTranslation();
  const { completeTask, uncompleteTask } = useStore();
  const [showCompleted, setShowCompleted] = useState(false);
  const [showEditPopover, setShowEditPopover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Draggable setup
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: template.id,
    disabled: !isEditMode,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Separate active and completed tasks
  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  // Calculate queue capacity and usage (only active tasks count toward capacity)
  const totalMinutes = calculateDuration(template.startTime, template.endTime);
  const usedMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const bufferMinutes = Math.max(0, totalMinutes - usedMinutes);
  const fillPercentage = calculateFillPercentage(usedMinutes, totalMinutes);
  const fillStatus = getFillStatus(fillPercentage);
  const fillColor = getFillColor(fillStatus);
  const isOverfilled = fillPercentage > 100;

  // Calculate height based on mode
  const cardHeight = isEditMode
    ? EDIT_MODE_HEIGHT
    : HEADER_HEIGHT + (totalMinutes / 60) * HEIGHT_PER_HOUR;

  // Format time display
  const timeDisplay = `${template.startTime.replace(
    ":00",
    ""
  )} - ${template.endTime.replace(":00", "")}`;

  const handleToggleComplete = (task: Task) => {
    if (task.status === "completed") {
      uncompleteTask(task.id);
    } else {
      completeTask(task.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditPopover(true);
  };

  // Edit Mode: Simplified card with drag handle
  if (isEditMode) {
    return (
      <>
        <div
          ref={(node) => {
            setNodeRef(node);
            (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          style={style}
          className={`
            relative rounded-lg border-2 transition-all duration-200 overflow-hidden
            ${isDragging ? "shadow-lg ring-2 ring-blue-400" : ""}
            border-solid hover:border-blue-400 cursor-grab active:cursor-grabbing
          `}
          {...attributes}
          {...listeners}
        >
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${queue.color}15` }}
          />

          {/* Content */}
          <div className="relative z-10 p-3">
            <div className="flex items-center gap-2">
              {/* Drag Handle */}
              <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: queue.color }}
              />

              {/* Queue info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {queue.title}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{timeDisplay}</span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatDuration(totalMinutes)} · {activeTasks.length} {t("queue.tasks", "tasks")}
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={handleEditClick}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Border color indicator */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: queue.color }}
          />
        </div>

        {/* Edit Popover */}
        {showEditPopover && (
          <QueueEditPopover
            queue={queue}
            template={template}
            anchorEl={cardRef.current}
            onClose={() => setShowEditPopover(false)}
          />
        )}
      </>
    );
  }

  // Normal Mode: Full card with tasks
  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-lg border-2 transition-all duration-200 overflow-hidden
        ${
          isOverfilled
            ? "border-dashed border-red-400 overflow-warning"
            : "border-dashed border-gray-300"
        }
      `}
      style={{
        height: `${cardHeight}px`,
        minHeight: `${cardHeight}px`,
      }}
    >
      {/* Water Level Background */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
        style={{
          height: `${Math.min(fillPercentage, 100)}%`,
          backgroundColor: fillColor,
          opacity: 0.15,
        }}
      />

      {/* Buffer Pattern (empty space) */}
      {bufferMinutes > 0 && !isOverfilled && (
        <div
          className="absolute top-0 left-0 right-0 buffer-pattern"
          style={{
            height: `${100 - fillPercentage}%`,
            opacity: 0.5,
          }}
        />
      )}

      {/* Queue Header */}
      <div className="relative z-10 p-2 border-b border-gray-200 bg-white/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: queue.color }}
            />
            <span className="text-xs font-medium text-gray-600">
              {timeDisplay}
            </span>
          </div>
          {/* Fill percentage indicator */}
          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-bold ${
                fillStatus === "safe"
                  ? "text-blue-600"
                  : fillStatus === "warning"
                  ? "text-amber-600"
                  : "text-red-600"
              }`}
            >
              {fillPercentage}%
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">
            {queue.title}
          </span>
          <span className="text-xs text-gray-500">
            ({formatDuration(usedMinutes)} / {formatDuration(totalMinutes)})
          </span>
        </div>
      </div>

      {/* Tasks in Queue */}
      <div className="relative z-10 p-2 space-y-1 overflow-y-auto" style={{ maxHeight: `${cardHeight - HEADER_HEIGHT - 10}px` }}>
        {/* Active Tasks */}
        {activeTasks.map((task, index) => {
          const isOverflowing = index === activeTasks.length - 1 && isOverfilled;
          return (
            <div
              key={task.id}
              className={`
                px-2 py-1.5 rounded text-xs font-medium
                transition-all
                ${
                  isOverflowing
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-white text-gray-700 border border-gray-200"
                }
              `}
              style={{
                backgroundColor: isOverflowing ? undefined : `${queue.color}20`,
                borderColor: isOverflowing ? undefined : `${queue.color}40`,
              }}
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`
                    w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                    transition-colors border-gray-300 hover:border-green-500
                  `}
                >
                  {/* Empty checkbox */}
                </button>
                <span className="truncate flex-1">{task.title}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                    isOverflowing ? "bg-red-200 text-red-700" : "bg-white/50"
                  }`}
                >
                  {formatDuration(task.durationMinutes)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-full mb-1"
            >
              {showCompleted ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              <span>
                {t("queue.completed", "Completed")} ({completedTasks.length})
              </span>
            </button>
            {showCompleted && (
              <div className="space-y-1">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="px-2 py-1.5 rounded text-xs bg-gray-50 text-gray-400 border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                                 bg-green-500 border-green-500 text-white"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <span className="truncate flex-1 line-through">{task.title}</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-gray-100">
                        {formatDuration(task.durationMinutes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-xs">{queue.title}</span>
            <span className="text-xs">
              ({formatDuration(totalMinutes)} {t("queue.capacity")})
            </span>
          </div>
        )}

        {/* Buffer indicator */}
        {bufferMinutes > 0 && activeTasks.length > 0 && (
          <div className="mt-2 px-2 py-1 rounded bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-500 text-center">
            {t("queue.buffer")} ({formatDuration(bufferMinutes)})
          </div>
        )}
      </div>

      {/* Overflow Warning */}
      {isOverfilled && (
        <div className="absolute top-1 right-1 z-20 flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {t("queue.overCapacity")} (-
          {formatDuration(usedMinutes - totalMinutes)})
        </div>
      )}
    </div>
  );
}
