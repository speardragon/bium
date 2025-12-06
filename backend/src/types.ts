// Type definitions for 비움 (bium)

export interface Queue {
  id: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // "09:00"
  endTime: string;   // "11:00"
  title: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'inbox' | 'assigned';
  assignedTo: {
    date: string;
    queueId: string;
  } | null;
}

export interface WeeklyPlanEntry {
  date: string;
  queueTemplateId: string;
  tasks: string[]; // Task IDs
}

export interface WeeklyPlan {
  [weekKey: string]: WeeklyPlanEntry[];
}

export interface Database {
  queues: Queue[];
  tasks: Task[];
  weeklyPlan: WeeklyPlan;
}
