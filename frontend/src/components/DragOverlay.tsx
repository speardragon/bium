import { Task } from "../types";
import { formatDuration } from "../utils";

interface DragOverlayContentProps {
  task: Task;
}

export function DragOverlayContent({ task }: DragOverlayContentProps) {
  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl cursor-grabbing w-56 opacity-90">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-800 font-medium truncate flex-1">
          {task.title}
        </span>
        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded">
          {formatDuration(task.durationMinutes)}
        </span>
      </div>
    </div>
  );
}
