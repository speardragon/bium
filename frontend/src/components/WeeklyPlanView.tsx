import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useStore } from "../store/useStore";
import { QueueCard } from "./QueueCard";
import { AddQueuePopover } from "./AddQueuePopover";
import { getWeekDates } from "../utils";
import { Queue, QueueTemplate, Task } from "../types";
import { Pencil, Check, Plus, RefreshCw } from "lucide-react";

export function WeeklyPlanView() {
  const { t } = useTranslation();
  const {
    queues,
    queueTemplates,
    tasks,
    emptyAllQueues,
    isEditMode,
    setEditMode,
    updateQueueTemplate,
  } = useStore();
  const weekDates = getWeekDates();

  // Drag state
  const [activeTemplate, setActiveTemplate] = useState<QueueTemplate | null>(null);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);

  // Add queue popover state
  const [addPopoverDay, setAddPopoverDay] = useState<{
    dayOfWeek: number;
    dayName: string;
    anchorEl: HTMLElement;
  } | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Map day names to translation keys
  const dayNameKeys: { [key: string]: string } = {
    Mon: "common.monday",
    Tue: "common.tuesday",
    Wed: "common.wednesday",
    Thu: "common.thursday",
    Fri: "common.friday",
    Sat: "common.saturday",
    Sun: "common.sunday",
  };

  // Get queue templates for a specific day of week
  const getTemplatesForDay = (dayOfWeek: number): QueueTemplate[] => {
    return queueTemplates
      .filter((qt) => qt.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get queue by id
  const getQueueById = (queueId: string): Queue | undefined => {
    return queues.find((q) => q.id === queueId);
  };

  // Get tasks for a specific queue (tasks assigned to this queue, sorted alphabetically)
  const getQueueTasks = (queueId: string): Task[] => {
    return tasks
      .filter((t) => t.assignedQueueId === queueId)
      .sort((a, b) => a.title.localeCompare(b.title));
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const templateId = active.id as string;
    const template = queueTemplates.find((qt) => qt.id === templateId);
    if (template) {
      setActiveTemplate(template);
      const queue = getQueueById(template.queueId);
      setActiveQueue(queue || null);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTemplate(null);
    setActiveQueue(null);

    if (!over) return;

    const templateId = active.id as string;
    const targetDayOfWeek = parseInt(over.id as string);

    const template = queueTemplates.find((qt) => qt.id === templateId);
    if (!template || template.dayOfWeek === targetDayOfWeek) return;

    // Update the template's day of week
    await updateQueueTemplate(templateId, { dayOfWeek: targetDayOfWeek });
  };

  // Handle add queue button click
  const handleAddQueueClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    dayOfWeek: number,
    dayName: string
  ) => {
    setAddPopoverDay({
      dayOfWeek,
      dayName,
      anchorEl: event.currentTarget,
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800">{t("weeklyPlan.title")}</h1>
        <div className="flex items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => setEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              isEditMode
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-4 h-4" />
                {t("weeklyPlan.doneEditing", "Done")}
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4" />
                {t("weeklyPlan.editMode", "Edit")}
              </>
            )}
          </button>

          {/* Empty All Queues */}
          <button
            onClick={emptyAllQueues}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 
                     bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t("weeklyPlan.emptyAllQueues")}
          </button>
        </div>
      </div>

      {/* Edit Mode Banner */}
      {isEditMode && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-sm text-blue-700">
            {t(
              "weeklyPlan.editModeHint",
              "Drag queues to move them between days. Click a queue to edit its details. Click '+' to add a queue."
            )}
          </p>
        </div>
      )}

      {/* Week Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4">
          <div className="grid grid-cols-5 gap-4 min-w-[800px]">
            {weekDates.map(({ date, dayOfWeek, dayName, isToday }) => {
              const dayTemplates = getTemplatesForDay(dayOfWeek);
              const translatedDayName = t(dayNameKeys[dayName] || dayName);

              return (
                <DayColumn
                  key={date}
                  dayOfWeek={dayOfWeek}
                  dayName={translatedDayName}
                  templates={dayTemplates}
                  getQueueById={getQueueById}
                  getQueueTasks={getQueueTasks}
                  isEditMode={isEditMode}
                  isToday={isToday}
                  onAddClick={(e) => handleAddQueueClick(e, dayOfWeek, translatedDayName)}
                />
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTemplate && activeQueue && (
            <div className="opacity-80">
              <QueueCard
                queue={activeQueue}
                template={activeTemplate}
                tasks={getQueueTasks(activeQueue.id)}
                isEditMode={true}
                isDragging={true}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Add Queue Popover */}
      {addPopoverDay && (
        <AddQueuePopover
          dayOfWeek={addPopoverDay.dayOfWeek}
          dayName={addPopoverDay.dayName}
          anchorEl={addPopoverDay.anchorEl}
          onClose={() => setAddPopoverDay(null)}
        />
      )}
    </div>
  );
}

// Day Column Component (for droppable area)
import { useDroppable } from "@dnd-kit/core";

interface DayColumnProps {
  dayOfWeek: number;
  dayName: string;
  templates: QueueTemplate[];
  getQueueById: (queueId: string) => Queue | undefined;
  getQueueTasks: (queueId: string) => Task[];
  isEditMode: boolean;
  isToday: boolean;
  onAddClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function DayColumn({
  dayOfWeek,
  dayName,
  templates,
  getQueueById,
  getQueueTasks,
  isEditMode,
  isToday,
  onAddClick,
}: DayColumnProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: dayOfWeek.toString(),
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-h-[200px] transition-colors rounded-lg ${
        isOver && isEditMode ? "bg-blue-50" : ""
      } ${isToday ? "bg-blue-50/50" : ""}`}
    >
      {/* Day Header */}
      <div className={`text-center py-2 mb-3 border-b-2 ${
        isToday ? "border-blue-500 bg-blue-500 rounded-t-lg" : "border-gray-200"
      }`}>
        <span className={`text-sm font-bold ${isToday ? "text-white" : "text-gray-700"}`}>
          {dayName}
          {isToday && <span className="ml-1 text-xs font-normal">({t("common.today", "Today")})</span>}
        </span>
      </div>

      {/* Queues for this day */}
      <div className="space-y-3 flex-1">
        {templates.length === 0 && !isEditMode && (
          <div className="p-4 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            {t("weeklyPlan.noQueues")}
          </div>
        )}

        {templates.length === 0 && isEditMode && (
          <div
            className={`p-4 text-center text-sm border-2 border-dashed rounded-lg transition-colors ${
              isOver ? "border-blue-400 bg-blue-50 text-blue-500" : "border-gray-300 text-gray-400"
            }`}
          >
            {isOver
              ? t("weeklyPlan.dropHere", "Drop here")
              : t("weeklyPlan.noQueuesEdit", "No queues")}
          </div>
        )}

        {templates.map((template) => {
          const queue = getQueueById(template.queueId);
          if (!queue) return null;

          return (
            <QueueCard
              key={template.id}
              queue={queue}
              template={template}
              tasks={getQueueTasks(queue.id)}
              isEditMode={isEditMode}
            />
          );
        })}
      </div>

      {/* Add Queue Button (Edit Mode Only) */}
      {isEditMode && (
        <button
          onClick={onAddClick}
          className="mt-3 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 
                   border-2 border-dashed border-gray-300 rounded-lg
                   hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t("weeklyPlan.addQueue", "Add")}
        </button>
      )}
    </div>
  );
}
