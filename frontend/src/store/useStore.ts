import { create } from 'zustand';
import { Queue, Task, WeeklyPlan, SupportedLanguage, Settings } from '../types';
import { getCurrentWeekKey } from '../utils';
import i18n from '../i18n';

const API_URL = '/api';

interface AppState {
  // Data
  queues: Queue[];
  tasks: Task[];
  weeklyPlan: WeeklyPlan;
  currentWeekKey: string;
  settings: Settings;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchQueues: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchWeeklyPlan: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  
  addTask: (title: string, durationMinutes: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  assignTask: (taskId: string, queueId: string, date: string) => Promise<void>;
  unassignTask: (taskId: string) => Promise<void>;
  emptyAllQueues: () => Promise<void>;
  
  addQueue: (queue: Omit<Queue, 'id'>) => Promise<void>;
  deleteQueue: (queueId: string) => Promise<void>;
  
  setLanguage: (language: SupportedLanguage) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  queues: [],
  tasks: [],
  weeklyPlan: {},
  currentWeekKey: getCurrentWeekKey(),
  settings: { language: 'en' },
  isLoading: false,
  error: null,
  
  // Fetch queues
  fetchQueues: async () => {
    try {
      const res = await fetch(`${API_URL}/queues`);
      const queues = await res.json();
      set({ queues });
    } catch (error) {
      set({ error: 'Failed to fetch queues' });
    }
  },
  
  // Fetch tasks
  fetchTasks: async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const tasks = await res.json();
      set({ tasks });
    } catch (error) {
      set({ error: 'Failed to fetch tasks' });
    }
  },
  
  // Fetch weekly plan
  fetchWeeklyPlan: async () => {
    try {
      const res = await fetch(`${API_URL}/weekly-plan`);
      const weeklyPlan = await res.json();
      set({ weeklyPlan });
    } catch (error) {
      set({ error: 'Failed to fetch weekly plan' });
    }
  },
  
  // Fetch settings
  fetchSettings: async () => {
    try {
      const res = await fetch(`${API_URL}/settings`);
      const settings = await res.json();
      set({ settings });
      // Sync i18n with fetched settings
      if (settings.language && i18n.language !== settings.language) {
        i18n.changeLanguage(settings.language);
      }
    } catch (error) {
      set({ error: 'Failed to fetch settings' });
    }
  },
  
  // Add a new task
  addTask: async (title: string, durationMinutes: number) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, durationMinutes })
      });
      const newTask = await res.json();
      set(state => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      set({ error: 'Failed to add task' });
    }
  },
  
  // Delete a task
  deleteTask: async (taskId: string) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
    } catch (error) {
      set({ error: 'Failed to delete task' });
    }
  },
  
  // Assign task to queue
  assignTask: async (taskId: string, queueId: string, date: string) => {
    const { currentWeekKey } = get();
    try {
      const res = await fetch(`${API_URL}/weekly-plan/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, queueId, date, weekKey: currentWeekKey })
      });
      const { task } = await res.json();
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t)
      }));
      
      // Refresh weekly plan
      get().fetchWeeklyPlan();
    } catch (error) {
      set({ error: 'Failed to assign task' });
    }
  },
  
  // Unassign task from queue
  unassignTask: async (taskId: string) => {
    const { currentWeekKey } = get();
    try {
      const res = await fetch(`${API_URL}/weekly-plan/unassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, weekKey: currentWeekKey })
      });
      const task = await res.json();
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t)
      }));
      
      // Refresh weekly plan
      get().fetchWeeklyPlan();
    } catch (error) {
      set({ error: 'Failed to unassign task' });
    }
  },
  
  // Empty all queues
  emptyAllQueues: async () => {
    const { currentWeekKey } = get();
    try {
      await fetch(`${API_URL}/weekly-plan/empty-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey: currentWeekKey })
      });
      
      // Reset all tasks to inbox status
      set(state => ({
        tasks: state.tasks.map(t => ({
          ...t,
          status: 'inbox' as const,
          assignedTo: null
        })),
        weeklyPlan: {}
      }));
    } catch (error) {
      set({ error: 'Failed to empty queues' });
    }
  },
  
  // Add a new queue
  addQueue: async (queue: Omit<Queue, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/queues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queue)
      });
      const newQueue = await res.json();
      set(state => ({ queues: [...state.queues, newQueue] }));
    } catch (error) {
      set({ error: 'Failed to add queue' });
    }
  },
  
  // Delete a queue
  deleteQueue: async (queueId: string) => {
    try {
      await fetch(`${API_URL}/queues/${queueId}`, { method: 'DELETE' });
      set(state => ({
        queues: state.queues.filter(q => q.id !== queueId)
      }));
    } catch (error) {
      set({ error: 'Failed to delete queue' });
    }
  },
  
  // Set language
  setLanguage: async (language: SupportedLanguage) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });
      const settings = await res.json();
      set({ settings });
      // Update i18n
      i18n.changeLanguage(language);
    } catch (error) {
      set({ error: 'Failed to update language' });
    }
  }
}));
