import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Plus } from "lucide-react";
import { useStore } from "../store/useStore";

interface AddQueuePopoverProps {
  dayOfWeek: number;
  dayName: string;
  onClose: () => void;
  anchorEl: HTMLElement | null;
}

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function AddQueuePopover({ dayOfWeek, dayName, onClose, anchorEl }: AddQueuePopoverProps) {
  const { t } = useTranslation();
  const { queues, addQueueTemplate } = useStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(
    queues.length > 0 ? queues[0].id : null
  );
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Position popover relative to anchor element
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 300;
      const popoverHeight = 320;
      const viewportWidth = window.innerWidth;
      
      let left = rect.left;
      let top = rect.top - popoverHeight - 8;
      
      // Adjust horizontal position if needed
      if (left + popoverWidth > viewportWidth - 20) {
        left = viewportWidth - popoverWidth - 20;
      }
      
      // If not enough space above, show below
      if (top < 20) {
        top = rect.bottom + 8;
      }
      
      setPosition({
        top: Math.max(20, top),
        left: Math.max(20, left),
      });
    }
  }, [anchorEl]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleAdd = async () => {
    if (!selectedQueueId || !isValidTimeRange()) return;
    
    await addQueueTemplate(selectedQueueId, dayOfWeek, startTime, endTime);
    onClose();
  };

  // Validate end time is after start time
  const isValidTimeRange = () => {
    return startTime < endTime;
  };

  const selectedQueue = queues.find(q => q.id === selectedQueueId);

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        ref={popoverRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 w-[300px] overflow-hidden"
        style={{ top: position.top, left: position.left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <span className="font-semibold text-gray-800">
            {t("addQueue.title", "Add Queue")} - {dayName}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Queue Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("addQueue.selectQueue", "Select Queue")}
            </label>
            {queues.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                {t("addQueue.noQueues", "No queues available. Create one first in the Queues tab.")}
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {queues.map((queue) => (
                  <button
                    key={queue.id}
                    onClick={() => setSelectedQueueId(queue.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedQueueId === queue.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: queue.color }}
                    />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {queue.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              {t("addQueue.time", "Time")}
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

          {/* Add Button */}
          <button
            onClick={handleAdd}
            disabled={!selectedQueueId || !isValidTimeRange()}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              selectedQueueId && isValidTimeRange()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            {t("addQueue.add", "Add")}
            {selectedQueue && (
              <span className="opacity-75">({selectedQueue.title})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
