import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useStore } from "./store/useStore";
import { Header } from "./components/Header";
import { Inbox } from "./components/Inbox";
import { WeeklyPlanView } from "./components/WeeklyPlanView";
import { DragOverlayContent } from "./components/DragOverlay";
import { Task } from "./types";

function App() {
  const { fetchQueues, fetchTasks, fetchWeeklyPlan, assignTask, tasks } =
    useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetchQueues();
    fetchTasks();
    fetchWeeklyPlan();
  }, []);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const dropData = over.data.current as
      | { queue: { id: string }; date: string }
      | undefined;

    if (dropData) {
      const { queue, date } = dropData;
      assignTask(taskId, queue.id, date);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <Inbox />
          <WeeklyPlanView />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <DragOverlayContent task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
