import { create } from 'zustand';
import { Queue, QueueTemplate, Task, SupportedLanguage, Settings } from '../types';
import i18n from '../i18n';

const API_URL = '/api';

interface AppState {
  // Data
  queues: Queue[];
  queueTemplates: QueueTemplate[];
  tasks: Task[];
  settings: Settings;
  
  // UI State
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  activeTab: 'inbox' | 'queues';
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions - Fetch
  fetchQueues: () => Promise<void>;
  fetchQueueTemplates: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchAll: () => Promise<void>;
  
  // Actions - Tasks
  addTask: (title: string, durationMinutes: number) => Promise<void>;
  updateTask: (taskId: string, title: string, durationMinutes: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  uncompleteTask: (taskId: string) => Promise<void>;
  
  // Actions - Queue Assignment
  assignTaskToQueue: (taskId: string, queueId: string) => Promise<void>;
  unassignTaskFromQueue: (taskId: string, queueId: string) => Promise<void>;
  emptyAllQueues: () => Promise<void>;
  
  // Actions - Queues
  addQueue: (title: string, color: string) => Promise<void>;
  updateQueue: (queueId: string, title: string, color: string) => Promise<void>;
  deleteQueue: (queueId: string) => Promise<void>;
  
  // Actions - Queue Templates
  addQueueTemplate: (queueId: string, dayOfWeek: number, startTime: string, endTime: string) => Promise<void>;
  deleteQueueTemplate: (templateId: string) => Promise<void>;
  
  // Actions - Settings
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  
  // Actions - UI
  setSidebarWidth: (width: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: 'inbox' | 'queues') => void;
}

// Load sidebar state from localStorage
const loadSidebarState = () => {
  try {
    const saved = localStorage.getItem('bium-sidebar');
    if (saved) {
      const { width, collapsed } = JSON.parse(saved);
      return { width: width || 280, collapsed: collapsed || false };
    }
  } catch {
    // Ignore errors
  }
  return { width: 280, collapsed: false };
};

const saveSidebarState = (width: number, collapsed: boolean) => {
  try {
    localStorage.setItem('bium-sidebar', JSON.stringify({ width, collapsed }));
  } catch {
    // Ignore errors
  }
};

const initialSidebarState = loadSidebarState();

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  queues: [],
  queueTemplates: [],
  tasks: [],
  settings: { language: 'en' },
  
  // UI State
  sidebarWidth: initialSidebarState.width,
  sidebarCollapsed: initialSidebarState.collapsed,
  activeTab: 'inbox',
  
  isLoading: false,
  error: null,
  
  // Fetch queues
  fetchQueues: async () => {
    try {
      const res = await fetch(`${API_URL}/queues`);
      const queues = await res.json();
      set({ queues });
    } catch {
      set({ error: 'Failed to fetch queues' });
    }
  },
  
  // Fetch queue templates
  fetchQueueTemplates: async () => {
    try {
      const res = await fetch(`${API_URL}/queue-templates`);
      const queueTemplates = await res.json();
      set({ queueTemplates });
    } catch {
      set({ error: 'Failed to fetch queue templates' });
    }
  },
  
  // Fetch tasks
  fetchTasks: async () => {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      const tasks = await res.json();
      set({ tasks });
    } catch {
      set({ error: 'Failed to fetch tasks' });
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
    } catch {
      set({ error: 'Failed to fetch settings' });
    }
  },
  
  // Fetch all data
  fetchAll: async () => {
    set({ isLoading: true });
    await Promise.all([
      get().fetchQueues(),
      get().fetchQueueTemplates(),
      get().fetchTasks(),
      get().fetchSettings(),
    ]);
    set({ isLoading: false });
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
    } catch {
      set({ error: 'Failed to add task' });
    }
  },
  
  // Update a task
  updateTask: async (taskId: string, title: string, durationMinutes: number) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, durationMinutes })
      });
      const updatedTask = await res.json();
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
    } catch {
      set({ error: 'Failed to update task' });
    }
  },
  
  // Delete a task
  deleteTask: async (taskId: string) => {
    try {
      await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        // Also remove from queues
        queues: state.queues.map(q => ({
          ...q,
          tasks: q.tasks.filter(t => t !== taskId)
        }))
      }));
    } catch {
      set({ error: 'Failed to delete task' });
    }
  },
  
  // Complete a task
  completeTask: async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: 'POST'
      });
      const updatedTask = await res.json();
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
    } catch {
      set({ error: 'Failed to complete task' });
    }
  },
  
  // Uncomplete a task
  uncompleteTask: async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}/uncomplete`, {
        method: 'POST'
      });
      const updatedTask = await res.json();
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
    } catch {
      set({ error: 'Failed to uncomplete task' });
    }
  },
  
  // Assign task to queue
  assignTaskToQueue: async (taskId: string, queueId: string) => {
    try {
      const res = await fetch(`${API_URL}/queues/${queueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const { queue, task } = await res.json();
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        queues: state.queues.map(q => q.id === queueId ? queue : q)
      }));
    } catch {
      set({ error: 'Failed to assign task' });
    }
  },
  
  // Unassign task from queue
  unassignTaskFromQueue: async (taskId: string, queueId: string) => {
    try {
      const res = await fetch(`${API_URL}/queues/${queueId}/unassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const { queue, task } = await res.json();
      
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? task : t),
        queues: state.queues.map(q => q.id === queueId ? queue : q)
      }));
    } catch {
      set({ error: 'Failed to unassign task' });
    }
  },
  
  // Empty all queues
  emptyAllQueues: async () => {
    try {
      await fetch(`${API_URL}/queues/empty-all`, {
        method: 'POST'
      });
      
      // Reset all tasks to inbox status and clear queue tasks
      set(state => ({
        tasks: state.tasks.map(t => ({
          ...t,
          status: 'inbox' as const,
          assignedQueueId: null,
          completedAt: null
        })),
        queues: state.queues.map(q => ({
          ...q,
          tasks: []
        }))
      }));
    } catch {
      set({ error: 'Failed to empty queues' });
    }
  },
  
  // Add a new queue
  addQueue: async (title: string, color: string) => {
    try {
      const res = await fetch(`${API_URL}/queues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color })
      });
      const newQueue = await res.json();
      set(state => ({ queues: [...state.queues, newQueue] }));
    } catch {
      set({ error: 'Failed to add queue' });
    }
  },
  
  // Update a queue
  updateQueue: async (queueId: string, title: string, color: string) => {
    try {
      const res = await fetch(`${API_URL}/queues/${queueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color })
      });
      const updatedQueue = await res.json();
      set(state => ({
        queues: state.queues.map(q => q.id === queueId ? updatedQueue : q)
      }));
    } catch {
      set({ error: 'Failed to update queue' });
    }
  },
  
  // Delete a queue
  deleteQueue: async (queueId: string) => {
    try {
      await fetch(`${API_URL}/queues/${queueId}`, { method: 'DELETE' });
      // Refresh all data since tasks might be moved to inbox
      get().fetchAll();
    } catch {
      set({ error: 'Failed to delete queue' });
    }
  },
  
  // Add a queue template
  addQueueTemplate: async (queueId: string, dayOfWeek: number, startTime: string, endTime: string) => {
    try {
      const res = await fetch(`${API_URL}/queue-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, dayOfWeek, startTime, endTime })
      });
      const newTemplate = await res.json();
      set(state => ({ queueTemplates: [...state.queueTemplates, newTemplate] }));
    } catch {
      set({ error: 'Failed to add queue template' });
    }
  },
  
  // Delete a queue template
  deleteQueueTemplate: async (templateId: string) => {
    try {
      await fetch(`${API_URL}/queue-templates/${templateId}`, { method: 'DELETE' });
      set(state => ({
        queueTemplates: state.queueTemplates.filter(qt => qt.id !== templateId)
      }));
    } catch {
      set({ error: 'Failed to delete queue template' });
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
    } catch {
      set({ error: 'Failed to update language' });
    }
  },
  
  // UI Actions
  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: width });
    saveSidebarState(width, get().sidebarCollapsed);
  },
  
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
    saveSidebarState(get().sidebarWidth, collapsed);
  },
  
  setActiveTab: (tab: 'inbox' | 'queues') => {
    set({ activeTab: tab });
  },
}));
