import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import { QueueCard } from "./QueueCard";
import { getWeekDates } from "../utils";
import { Queue, QueueTemplate, Task } from "../types";

export function WeeklyPlanView() {
  const { t } = useTranslation();
  const { queues, queueTemplates, tasks, emptyAllQueues } = useStore();
  const weekDates = getWeekDates();

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
    return queueTemplates.filter((qt) => qt.dayOfWeek === dayOfWeek);
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800">{t("weeklyPlan.title")}</h1>
        <button
          onClick={emptyAllQueues}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 
                   bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          {t("weeklyPlan.emptyAllQueues")}
        </button>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-5 gap-4 min-w-[800px]">
          {weekDates.map(({ date, dayOfWeek, dayName }) => {
            const dayTemplates = getTemplatesForDay(dayOfWeek);
            const translatedDayName = t(dayNameKeys[dayName] || dayName);

            return (
              <div key={date} className="flex flex-col">
                {/* Day Header */}
                <div className="text-center py-2 mb-3 border-b-2 border-gray-200">
                  <span className="text-sm font-bold text-gray-700">
                    {translatedDayName}
                  </span>
                </div>

                {/* Queues for this day */}
                <div className="space-y-3">
                  {dayTemplates.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      {t("weeklyPlan.noQueues")}
                    </div>
                  ) : (
                    dayTemplates.map((template) => {
                      const queue = getQueueById(template.queueId);
                      if (!queue) return null;

                      return (
                        <QueueCard
                          key={template.id}
                          queue={queue}
                          template={template}
                          tasks={getQueueTasks(queue.id)}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
