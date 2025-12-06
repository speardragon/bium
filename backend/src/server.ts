import express from 'express';
import cors from 'cors';
import { initDb, db } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import { Queue, Task, WeeklyPlanEntry } from './types.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database
await initDb();

// ==================== QUEUES API ====================

// Get all queues
app.get('/api/queues', (req, res) => {
  res.json(db.data?.queues || []);
});

// Create a new queue
app.post('/api/queues', async (req, res) => {
  const { dayOfWeek, startTime, endTime, title, color } = req.body;
  
  const newQueue: Queue = {
    id: `q_${uuidv4().slice(0, 8)}`,
    dayOfWeek,
    startTime,
    endTime,
    title,
    color: color || '#3B82F6'
  };
  
  db.data?.queues.push(newQueue);
  await db.write();
  
  res.status(201).json(newQueue);
});

// Update a queue
app.put('/api/queues/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const queueIndex = db.data?.queues.findIndex(q => q.id === id);
  if (queueIndex === undefined || queueIndex === -1) {
    return res.status(404).json({ error: 'Queue not found' });
  }
  
  db.data!.queues[queueIndex] = { ...db.data!.queues[queueIndex], ...updates };
  await db.write();
  
  res.json(db.data!.queues[queueIndex]);
});

// Delete a queue
app.delete('/api/queues/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!db.data) return res.status(500).json({ error: 'Database error' });
  
  db.data.queues = db.data.queues.filter(q => q.id !== id);
  await db.write();
  
  res.status(204).send();
});

// ==================== TASKS API ====================

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(db.data?.tasks || []);
});

// Get inbox tasks only
app.get('/api/tasks/inbox', (req, res) => {
  const inboxTasks = db.data?.tasks.filter(t => t.status === 'inbox') || [];
  res.json(inboxTasks);
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, durationMinutes } = req.body;
  
  const newTask: Task = {
    id: `t_${uuidv4().slice(0, 8)}`,
    title,
    durationMinutes: durationMinutes || 30, // Default 30 minutes
    status: 'inbox',
    assignedTo: null
  };
  
  db.data?.tasks.push(newTask);
  await db.write();
  
  res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const taskIndex = db.data?.tasks.findIndex(t => t.id === id);
  if (taskIndex === undefined || taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  db.data!.tasks[taskIndex] = { ...db.data!.tasks[taskIndex], ...updates };
  await db.write();
  
  res.json(db.data!.tasks[taskIndex]);
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!db.data) return res.status(500).json({ error: 'Database error' });
  
  db.data.tasks = db.data.tasks.filter(t => t.id !== id);
  await db.write();
  
  res.status(204).send();
});

// ==================== WEEKLY PLAN API ====================

// Get weekly plan for a specific week
app.get('/api/weekly-plan/:weekKey', (req, res) => {
  const { weekKey } = req.params;
  const plan = db.data?.weeklyPlan[weekKey] || [];
  res.json(plan);
});

// Get full weekly plan
app.get('/api/weekly-plan', (req, res) => {
  res.json(db.data?.weeklyPlan || {});
});

// Assign task to a queue
app.post('/api/weekly-plan/assign', async (req, res) => {
  const { taskId, queueId, date, weekKey } = req.body;
  
  if (!db.data) return res.status(500).json({ error: 'Database error' });
  
  // Update task status
  const taskIndex = db.data.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  db.data.tasks[taskIndex].status = 'assigned';
  db.data.tasks[taskIndex].assignedTo = { date, queueId };
  
  // Update weekly plan
  if (!db.data.weeklyPlan[weekKey]) {
    db.data.weeklyPlan[weekKey] = [];
  }
  
  let entry = db.data.weeklyPlan[weekKey].find(
    e => e.date === date && e.queueTemplateId === queueId
  );
  
  if (!entry) {
    entry = { date, queueTemplateId: queueId, tasks: [] };
    db.data.weeklyPlan[weekKey].push(entry);
  }
  
  if (!entry.tasks.includes(taskId)) {
    entry.tasks.push(taskId);
  }
  
  await db.write();
  
  res.json({ task: db.data.tasks[taskIndex], entry });
});

// Unassign task from queue (move back to inbox)
app.post('/api/weekly-plan/unassign', async (req, res) => {
  const { taskId, weekKey } = req.body;
  
  if (!db.data) return res.status(500).json({ error: 'Database error' });
  
  // Get task info before unassigning
  const task = db.data.tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  // Remove from weekly plan
  if (db.data.weeklyPlan[weekKey]) {
    db.data.weeklyPlan[weekKey].forEach(entry => {
      entry.tasks = entry.tasks.filter(id => id !== taskId);
    });
    // Clean up empty entries
    db.data.weeklyPlan[weekKey] = db.data.weeklyPlan[weekKey].filter(
      entry => entry.tasks.length > 0
    );
  }
  
  // Update task status
  const taskIndex = db.data.tasks.findIndex(t => t.id === taskId);
  db.data.tasks[taskIndex].status = 'inbox';
  db.data.tasks[taskIndex].assignedTo = null;
  
  await db.write();
  
  res.json(db.data.tasks[taskIndex]);
});

// Empty all queues for a week
app.post('/api/weekly-plan/empty-all', async (req, res) => {
  const { weekKey } = req.body;
  
  if (!db.data) return res.status(500).json({ error: 'Database error' });
  
  // Move all assigned tasks back to inbox
  db.data.tasks.forEach(task => {
    if (task.status === 'assigned') {
      task.status = 'inbox';
      task.assignedTo = null;
    }
  });
  
  // Clear weekly plan for the week
  if (db.data.weeklyPlan[weekKey]) {
    delete db.data.weeklyPlan[weekKey];
  }
  
  await db.write();
  
  res.json({ message: 'All queues emptied' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MEQ Backend running on http://localhost:${PORT}`);
});
