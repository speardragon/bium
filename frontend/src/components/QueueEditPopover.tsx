import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Trash2 } from "lucide-react";
import { Queue, QueueTemplate } from "../types";
import { useStore } from "../store/useStore";

interface QueueEditPopoverProps {
  queue: Queue;
  template: QueueTemplate;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

const PRESET_COLORS = [
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function QueueEditPopover({ queue, template, onClose, anchorEl }: QueueEditPopoverProps) {
  const { t } = useTranslation();
  const { updateQueue, updateQueueTemplate, deleteQueueTemplate } = useStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(queue.title);
  const [color, setColor] = useState(queue.color);
  const [startTime, setStartTime] = useState(template.startTime);
  const [endTime, setEndTime] = useState(template.endTime);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Position popover relative to anchor element
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 320;
      const viewportWidth = window.innerWidth;
      
      let left = rect.left;
      if (left + popoverWidth > viewportWidth - 20) {
        left = viewportWidth - popoverWidth - 20;
      }
      
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(20, left),
      });
    }
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleSave();
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, color, startTime, endTime]);

  const handleSave = async () => {
    // Update queue (name, color) - affects all days
    if (title !== queue.title || color !== queue.color) {
      await updateQueue(queue.id, title, color);
    }
    
    // Update template (time) - affects only this day
    if (startTime !== template.startTime || endTime !== template.endTime) {
      await updateQueueTemplate(template.id, { startTime, endTime });
    }
  };

  const handleDelete = async () => {
    await deleteQueueTemplate(template.id);
    onClose();
  };

  // Validate end time is after start time
  const isValidTimeRange = () => {
    return startTime < endTime;
  };

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        ref={popoverRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 w-80 overflow-hidden"
        style={{ top: position.top, left: position.left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold text-gray-800">{title}</span>
          </div>
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Queue Name */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("editQueue.name", "Queue Name")}
              <span className="text-gray-400 ml-1">
                ({t("editQueue.affectsAllDays", "affects all days")})
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("editQueue.namePlaceholder", "Enter queue name")}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("editQueue.color", "Color")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c 
                      ? "ring-2 ring-offset-2 ring-gray-400 scale-110" 
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("editQueue.time", "Time")}
              <span className="text-gray-400 ml-1">
                ({t("editQueue.thisDayOnly", "this day only")})
              </span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span className="text-gray-400">~</span>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         ${!isValidTimeRange() ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            {!isValidTimeRange() && (
              <p className="text-xs text-red-500 mt-1">
                {t("editQueue.invalidTime", "End time must be after start time")}
              </p>
            )}
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-gray-100">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {t("editQueue.removeFromDay", "Remove from this day")}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {t("editQueue.confirmDelete", "Are you sure?")}
                </span>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  {t("common.delete", "Delete")}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  {t("common.cancel", "Cancel")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
