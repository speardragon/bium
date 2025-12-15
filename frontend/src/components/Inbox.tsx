import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, ArrowRight, X } from "lucide-react";
import { Task, Queue } from "../types";
import { formatDuration } from "../utils";
import { useStore } from "../store/useStore";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onAssign: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function TaskCard({ task, onEdit, onAssign, onDelete }: TaskCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2 hover:border-gray-300 transition-all group">
      <div className="flex items-center justify-between gap-2">
        {/* Title - clickable for edit */}
        <span
          onClick={() => onEdit(task)}
          className="text-sm text-gray-800 font-medium truncate flex-1 cursor-pointer hover:text-blue-600"
        >
          {task.title}
        </span>
        
        {/* Duration badge */}
        <div className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded flex-shrink-0">
          {formatDuration(task.durationMinutes)}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Assign to queue button */}
          <button
            onClick={() => onAssign(task)}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
            title="Assign to queue"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  task: Task;
  onClose: () => void;
  onSave: (taskId: string, title: string, durationMinutes: number) => void;
}

function EditModal({ task, onClose, onSave }: EditModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(task.title);
  const [duration, setDuration] = useState(task.durationMinutes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(task.id, title.trim(), duration);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-80 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("inbox.editTask")}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("inbox.taskTitle")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("inbox.timeEstimation")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-600 w-12">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface QueueSelectorModalProps {
  task: Task;
  queues: Queue[];
  onClose: () => void;
  onSelect: (taskId: string, queueId: string) => void;
}

function QueueSelectorModal({ task, queues, onClose, onSelect }: QueueSelectorModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 w-72 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">
            {t("inbox.assignToQueue", "Assign to Queue")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-3 truncate">
          {task.title}
        </p>

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {queues.map((queue) => (
            <button
              key={queue.id}
              onClick={() => {
                onSelect(task.id, queue.id);
                onClose();
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 
                       hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: queue.color }}
              />
              <span className="text-sm text-gray-700 truncate">{queue.title}</span>
            </button>
          ))}
          
          {queues.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              {t("inbox.noQueues", "No queues available")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Inbox() {
  const { t } = useTranslation();
  const { tasks, queues, addTask, updateTask, deleteTask, assignTaskToQueue } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);

  const inboxTasks = tasks.filter((t) => t.status === "inbox");

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim(), newTaskDuration);
      setNewTaskTitle("");
      setNewTaskDuration(30);
    }
  };

  const handleEditTask = (taskId: string, title: string, durationMinutes: number) => {
    updateTask(taskId, title, durationMinutes);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm(t("inbox.confirmDelete", "Delete this task?"))) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-x-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {t("inbox.title")}
          {inboxTasks.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({inboxTasks.length})
            </span>
          )}
        </h2>
      </div>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder={t("inbox.addTask")}
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
          <span>{t("inbox.timeEstimation")}</span>
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
      <div className="flex-1 p-4 overflow-y-auto">
        {inboxTasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            <p>{t("inbox.noTasks")}</p>
            <p className="text-xs mt-1">{t("inbox.noTasksHint")}</p>
          </div>
        ) : (
          inboxTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={setEditingTask}
              onAssign={setAssigningTask}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
        />
      )}

      {/* Queue Selector Modal */}
      {assigningTask && (
        <QueueSelectorModal
          task={assigningTask}
          queues={queues}
          onClose={() => setAssigningTask(null)}
          onSelect={assignTaskToQueue}
        />
      )}
    </div>
  );
}
