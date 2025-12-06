export interface Queue {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  tasks: string[];
}

export interface WeeklyPlan {
  [weekKey: string]: WeeklyPlanEntry[];
}
