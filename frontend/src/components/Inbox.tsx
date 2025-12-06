import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Task } from "../types";
import { formatDuration } from "../utils";
import { useStore } from "../store/useStore";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-grab
        hover:border-blue-300 hover:shadow-sm transition-all
        ${isDragging ? "dragging opacity-50" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-800 font-medium truncate flex-1">
          {task.title}
        </span>
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
          {formatDuration(task.durationMinutes)}
        </span>
      </div>
    </div>
  );
}

interface InboxProps {}

export function Inbox({}: InboxProps) {
  const { tasks, addTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);

  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskDuration);
      setNewTaskTitle("");
      setNewTaskDuration(30);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Inbox</h2>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span>Required time estimation</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="range"
            min="15"
            max="180"
            step="15"
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-600 w-12">
            {formatDuration(newTaskDuration)}
          </span>
        </div>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4">
        {inboxTasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <p>No tasks in inbox</p>
            <p className="text-xs mt-1">Add a task above to get started</p>
          </div>
        ) : (
          inboxTasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
