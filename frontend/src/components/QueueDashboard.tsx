import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Task, Queue } from '../types';
import { formatDuration, calculateFillPercentage, getFillStatus } from '../utils';

interface QueueCardItemProps {
  task: Task;
  onComplete: () => void;
  onUncomplete: () => void;
  onRemove: () => void;
}

function QueueCardItem({ task, onComplete, onUncomplete, onRemove }: QueueCardItemProps) {
  const isCompleted = task.status === 'completed';
  
  return (
    <div
      className={`
        flex items-center gap-2 p-2 rounded-lg transition-all group
        ${isCompleted 
          ? 'bg-gray-50 text-gray-400' 
          : 'bg-white border border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <button
        onClick={isCompleted ? onUncomplete : onComplete}
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${isCompleted 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-blue-500'
          }
        `}
      >
        {isCompleted && <Check className="w-3 h-3" />}
      </button>
      <span className={`flex-1 text-sm truncate ${isCompleted ? 'line-through' : ''}`}>
        {task.title}
      </span>
      <span className={`text-xs px-2 py-0.5 rounded ${isCompleted ? 'bg-gray-200' : 'bg-gray-100'}`}>
        {formatDuration(task.durationMinutes)}
      </span>
      {/* Remove from queue button */}
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove from queue"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

interface TaskSelectorModalProps {
  queue: Queue;
  inboxTasks: Task[];
  onClose: () => void;
  onSelect: (taskId: string, queueId: string) => void;
}

function TaskSelectorModal({ queue, inboxTasks, onClose, onSelect }: TaskSelectorModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 w-80 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: queue.color }}
            />
            <h3 className="text-sm font-semibold text-gray-800">
              {t("queue.addTask", "Add Task")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          {t("queue.selectFromInbox", "Select a task from Inbox")}
        </p>

        <div className="space-y-1.5 overflow-y-auto flex-1">
          {inboxTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                onSelect(task.id, queue.id);
                onClose();
              }}
              className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-200 
                       hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
            >
              <span className="text-sm text-gray-700 truncate">{task.title}</span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatDuration(task.durationMinutes)}
              </span>
            </button>
          ))}
          
          {inboxTasks.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              {t("queue.noInboxTasks", "No tasks in inbox")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface QueueCardProps {
  queue: Queue;
  tasks: Task[];
  totalMinutes: number;
  inboxTasks: Task[];
  onAssignTask: (taskId: string, queueId: string) => void;
}

function QueueCard({ queue, tasks, totalMinutes, inboxTasks, onAssignTask }: QueueCardProps) {
  const { t } = useTranslation();
  const { completeTask, uncompleteTask, unassignTaskFromQueue } = useStore();
  const [showCompleted, setShowCompleted] = useState(true);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  // Separate active and completed tasks
  const activeTasks = tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => a.title.localeCompare(b.title));
  const completedTasks = tasks
    .filter(t => t.status === 'completed')
    .sort((a, b) => a.title.localeCompare(b.title));

  // Calculate capacity based on active tasks only
  const usedMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
  const fillPercentage = calculateFillPercentage(usedMinutes, totalMinutes);
  const fillStatus = getFillStatus(fillPercentage);

  const fillColorClass = {
    safe: 'bg-blue-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
  }[fillStatus];

  return (
    <>
      <div className="rounded-lg border-2 border-gray-200 bg-white p-3 transition-all">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: queue.color }}
          />
          <h4 className="font-medium text-sm flex-1 truncate">{queue.title}</h4>
          <span className="text-xs text-gray-500">
            {formatDuration(usedMinutes)} / {formatDuration(totalMinutes)}
          </span>
        </div>

        {/* Capacity Gauge */}
        <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${fillColorClass}`}
            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
          />
        </div>

        {/* Active Tasks */}
        <div className="space-y-1.5">
          {activeTasks.map(task => (
            <QueueCardItem
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onUncomplete={() => uncompleteTask(task.id)}
              onRemove={() => unassignTaskFromQueue(task.id, queue.id)}
            />
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => setShowTaskSelector(true)}
          className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 
                   text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 
                   rounded-lg border border-dashed border-gray-300 hover:border-blue-300 
                   transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t("queue.addFromInbox", "Add from Inbox")}</span>
        </button>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 w-full"
            >
              {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{t('queue.completed', 'Completed')} ({completedTasks.length})</span>
            </button>
            {showCompleted && (
              <div className="space-y-1.5 mt-2">
                {completedTasks.map(task => (
                  <QueueCardItem
                    key={task.id}
                    task={task}
                    onComplete={() => completeTask(task.id)}
                    onUncomplete={() => uncompleteTask(task.id)}
                    onRemove={() => unassignTaskFromQueue(task.id, queue.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Selector Modal */}
      {showTaskSelector && (
        <TaskSelectorModal
          queue={queue}
          inboxTasks={inboxTasks}
          onClose={() => setShowTaskSelector(false)}
          onSelect={onAssignTask}
        />
      )}
    </>
  );
}

export function QueueDashboard() {
  const { t } = useTranslation();
  const { queues, queueTemplates, tasks, assignTaskToQueue } = useStore();

  // Get inbox tasks
  const inboxTasks = tasks.filter(t => t.status === 'inbox');

  // Get tasks for each queue
  const getQueueTasks = (queueId: string): Task[] => {
    return tasks.filter(t => t.assignedQueueId === queueId);
  };

  // Calculate total minutes for a queue from its templates
  const getQueueTotalMinutes = (queueId: string): number => {
    const templates = queueTemplates.filter(qt => qt.queueId === queueId);
    if (templates.length === 0) return 120; // Default 2 hours

    // Use the first template's duration as reference
    const template = templates[0];
    const [startHour, startMin] = template.startTime.split(':').map(Number);
    const [endHour, endMin] = template.endTime.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {t('sidebar.queues', 'Queues')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {t('sidebar.queuesDescriptionClick', 'Click "Add from Inbox" to assign tasks')}
        </p>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {queues.map(queue => (
          <QueueCard
            key={queue.id}
            queue={queue}
            tasks={getQueueTasks(queue.id)}
            totalMinutes={getQueueTotalMinutes(queue.id)}
            inboxTasks={inboxTasks}
            onAssignTask={assignTaskToQueue}
          />
        ))}

        {queues.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>{t('sidebar.noQueues', 'No queues defined')}</p>
            <p className="text-xs mt-1">{t('sidebar.createQueueHint', 'Go to Settings to create queues')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
