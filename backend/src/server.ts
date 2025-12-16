import "./env.js"; // Load .env first - must be before other imports
import express from "express";
import cors from "cors";
import { initDb, db } from "./db.js";
import { v4 as uuidv4 } from "uuid";
import { Queue, QueueTemplate, Task, SupportedLanguage } from "./types.js";
import { readdir, stat, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { existsSync } from "fs";
import { homedir } from "os";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize database
await initDb();

// ==================== QUEUES API ====================

// Get all queues
app.get("/api/queues", (req, res) => {
  res.json(db.data?.queues || []);
});

// Create a new queue
app.post("/api/queues", async (req, res) => {
  const { title, color } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const newQueue: Queue = {
    id: `q_${uuidv4().slice(0, 8)}`,
    title,
    color: color || "#3B82F6",
    tasks: [],
  };

  db.data.queues.push(newQueue);
  await db.write();

  res.status(201).json(newQueue);
});

// Update a queue
app.put("/api/queues/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const queueIndex = db.data?.queues.findIndex((q) => q.id === id);
  if (queueIndex === undefined || queueIndex === -1) {
    return res.status(404).json({ error: "Queue not found" });
  }

  db.data!.queues[queueIndex] = { ...db.data!.queues[queueIndex], ...updates };
  await db.write();

  res.json(db.data!.queues[queueIndex]);
});

// Delete a queue
app.delete("/api/queues/:id", async (req, res) => {
  const { id } = req.params;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  // Also remove queue templates that reference this queue
  db.data.queueTemplates = db.data.queueTemplates.filter((qt) => qt.queueId !== id);
  
  // Move tasks assigned to this queue back to inbox
  db.data.tasks.forEach((task) => {
    if (task.assignedQueueId === id) {
      task.status = "inbox";
      task.assignedQueueId = null;
    }
  });

  db.data.queues = db.data.queues.filter((q) => q.id !== id);
  await db.write();

  res.status(204).send();
});

// Assign task to a queue
app.post("/api/queues/:id/assign", async (req, res) => {
  const { id } = req.params;
  const { taskId } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const queueIndex = db.data.queues.findIndex((q) => q.id === id);
  if (queueIndex === -1) {
    return res.status(404).json({ error: "Queue not found" });
  }

  const taskIndex = db.data.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Remove from previous queue if assigned
  const previousQueueId = db.data.tasks[taskIndex].assignedQueueId;
  if (previousQueueId) {
    const prevQueueIndex = db.data.queues.findIndex((q) => q.id === previousQueueId);
    if (prevQueueIndex !== -1) {
      db.data.queues[prevQueueIndex].tasks = db.data.queues[prevQueueIndex].tasks.filter(
        (t) => t !== taskId
      );
    }
  }

  // Ensure tasks array exists
  if (!Array.isArray(db.data.queues[queueIndex].tasks)) {
    db.data.queues[queueIndex].tasks = [];
  }

  // Add to new queue
  if (!db.data.queues[queueIndex].tasks.includes(taskId)) {
    db.data.queues[queueIndex].tasks.push(taskId);
  }

  // Update task
  db.data.tasks[taskIndex].status = "assigned";
  db.data.tasks[taskIndex].assignedQueueId = id;

  await db.write();

  res.json({ queue: db.data.queues[queueIndex], task: db.data.tasks[taskIndex] });
});

// Unassign task from queue (move back to inbox)
app.post("/api/queues/:id/unassign", async (req, res) => {
  const { id } = req.params;
  const { taskId } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const queueIndex = db.data.queues.findIndex((q) => q.id === id);
  if (queueIndex === -1) {
    return res.status(404).json({ error: "Queue not found" });
  }

  const taskIndex = db.data.tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Remove from queue
  db.data.queues[queueIndex].tasks = db.data.queues[queueIndex].tasks.filter(
    (t) => t !== taskId
  );

  // Update task
  db.data.tasks[taskIndex].status = "inbox";
  db.data.tasks[taskIndex].assignedQueueId = null;
  db.data.tasks[taskIndex].completedAt = null;

  await db.write();

  res.json({ queue: db.data.queues[queueIndex], task: db.data.tasks[taskIndex] });
});

// ==================== QUEUE TEMPLATES API ====================

// Get all queue templates
app.get("/api/queue-templates", (req, res) => {
  res.json(db.data?.queueTemplates || []);
});

// Create a new queue template
app.post("/api/queue-templates", async (req, res) => {
  const { queueId, dayOfWeek, startTime, endTime } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  // Verify queue exists
  const queue = db.data.queues.find((q) => q.id === queueId);
  if (!queue) {
    return res.status(404).json({ error: "Queue not found" });
  }

  const newTemplate: QueueTemplate = {
    id: `qt_${uuidv4().slice(0, 8)}`,
    queueId,
    dayOfWeek,
    startTime,
    endTime,
  };

  // Ensure queueTemplates array exists
  if (!Array.isArray(db.data.queueTemplates)) {
    db.data.queueTemplates = [];
  }

  db.data.queueTemplates.push(newTemplate);
  await db.write();

  res.status(201).json(newTemplate);
});

// Update a queue template
app.put("/api/queue-templates/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const templateIndex = db.data?.queueTemplates.findIndex((qt) => qt.id === id);
  if (templateIndex === undefined || templateIndex === -1) {
    return res.status(404).json({ error: "Queue template not found" });
  }

  db.data!.queueTemplates[templateIndex] = {
    ...db.data!.queueTemplates[templateIndex],
    ...updates,
  };
  await db.write();

  res.json(db.data!.queueTemplates[templateIndex]);
});

// Delete a queue template
app.delete("/api/queue-templates/:id", async (req, res) => {
  const { id } = req.params;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  db.data.queueTemplates = db.data.queueTemplates.filter((qt) => qt.id !== id);
  await db.write();

  res.status(204).send();
});

// ==================== TASKS API ====================

// Get all tasks
app.get("/api/tasks", (req, res) => {
  res.json(db.data?.tasks || []);
});

// Get inbox tasks only
app.get("/api/tasks/inbox", (req, res) => {
  const inboxTasks = db.data?.tasks.filter((t) => t.status === "inbox") || [];
  res.json(inboxTasks);
});

// Create a new task
app.post("/api/tasks", async (req, res) => {
  const { title, durationMinutes } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const newTask: Task = {
    id: `t_${uuidv4().slice(0, 8)}`,
    title,
    durationMinutes: durationMinutes || 30, // Default 30 minutes
    status: "inbox",
    assignedQueueId: null,
    completedAt: null,
    obsidianLink: null,
  };

  db.data.tasks.push(newTask);
  await db.write();

  res.status(201).json(newTask);
});

// Update a task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const taskIndex = db.data?.tasks.findIndex((t) => t.id === id);
  if (taskIndex === undefined || taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  db.data!.tasks[taskIndex] = { ...db.data!.tasks[taskIndex], ...updates };
  await db.write();

  res.json(db.data!.tasks[taskIndex]);
});

// Complete a task
app.post("/api/tasks/:id/complete", async (req, res) => {
  const { id } = req.params;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const taskIndex = db.data.tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  db.data.tasks[taskIndex].status = "completed";
  db.data.tasks[taskIndex].completedAt = new Date().toISOString();

  await db.write();

  res.json(db.data.tasks[taskIndex]);
});

// Uncomplete a task (mark as assigned again)
app.post("/api/tasks/:id/uncomplete", async (req, res) => {
  const { id } = req.params;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  const taskIndex = db.data.tasks.findIndex((t) => t.id === id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  // Only uncomplete if task is completed and has an assigned queue
  if (db.data.tasks[taskIndex].assignedQueueId) {
    db.data.tasks[taskIndex].status = "assigned";
  } else {
    db.data.tasks[taskIndex].status = "inbox";
  }
  db.data.tasks[taskIndex].completedAt = null;

  await db.write();

  res.json(db.data.tasks[taskIndex]);
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  // Remove from any queue that has this task
  db.data.queues.forEach((queue) => {
    queue.tasks = queue.tasks.filter((taskId) => taskId !== id);
  });

  db.data.tasks = db.data.tasks.filter((t) => t.id !== id);
  await db.write();

  res.status(204).send();
});

// ==================== BULK OPERATIONS ====================

// Empty all queues (move all tasks back to inbox)
app.post("/api/queues/empty-all", async (req, res) => {
  if (!db.data) return res.status(500).json({ error: "Database error" });

  // Clear all queue task arrays
  db.data.queues.forEach((queue) => {
    queue.tasks = [];
  });

  // Move all assigned/completed tasks back to inbox
  db.data.tasks.forEach((task) => {
    if (task.status === "assigned" || task.status === "completed") {
      task.status = "inbox";
      task.assignedQueueId = null;
      task.completedAt = null;
    }
  });

  await db.write();

  res.json({ message: "All queues emptied" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==================== SETTINGS API ====================

// Get settings
app.get("/api/settings", (req, res) => {
  res.json(db.data?.settings || { language: "en" });
});

// Update settings
app.put("/api/settings", async (req, res) => {
  const { language, obsidianVaultPath, obsidianDefaultFolder } = req.body;

  if (!db.data) return res.status(500).json({ error: "Database error" });

  // Validate language
  const supportedLanguages: SupportedLanguage[] = ["ko", "en", "ja", "zh"];
  if (language && !supportedLanguages.includes(language)) {
    return res.status(400).json({ error: "Unsupported language" });
  }

  // Initialize settings if not exists
  if (!db.data.settings) {
    db.data.settings = { language: "en", obsidianVaultPath: null, obsidianDefaultFolder: null };
  }

  if (language) {
    db.data.settings.language = language;
  }

  if (obsidianVaultPath !== undefined) {
    db.data.settings.obsidianVaultPath = obsidianVaultPath;
  }

  if (obsidianDefaultFolder !== undefined) {
    db.data.settings.obsidianDefaultFolder = obsidianDefaultFolder;
  }

  await db.write();

  res.json(db.data.settings);
});

// ==================== OBSIDIAN API ====================

// Helper function to resolve ~ to home directory
function resolveVaultPath(path: string): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  if (path === "~") {
    return homedir();
  }
  return path;
}

// Helper function to recursively get all markdown files
async function getMarkdownFiles(dir: string, baseDir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip hidden files and folders (starting with .)
      if (entry.name.startsWith('.')) continue;
      
      if (entry.isDirectory()) {
        const subFiles = await getMarkdownFiles(fullPath, baseDir);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Return relative path from vault root
        const relativePath = fullPath.slice(baseDir.length + 1);
        files.push(relativePath);
      }
    }
  } catch {
    // Ignore errors for inaccessible directories
  }
  
  return files;
}

// Helper function to get folders
async function getFolders(dir: string, baseDir: string): Promise<string[]> {
  const folders: string[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden folders (starting with .)
      if (entry.name.startsWith('.')) continue;
      
      if (entry.isDirectory()) {
        const fullPath = join(dir, entry.name);
        const relativePath = fullPath.slice(baseDir.length + 1);
        folders.push(relativePath);
        
        // Get subfolders
        const subFolders = await getFolders(fullPath, baseDir);
        folders.push(...subFolders);
      }
    }
  } catch {
    // Ignore errors for inaccessible directories
  }
  
  return folders;
}

// Get all notes from Obsidian vault
app.get("/api/obsidian/notes", async (req, res) => {
  if (!db.data?.settings?.obsidianVaultPath) {
    return res.status(400).json({ error: "Obsidian vault path not configured" });
  }

  const vaultPath = resolveVaultPath(db.data.settings.obsidianVaultPath);
  
  if (!existsSync(vaultPath)) {
    return res.status(404).json({ error: "Vault path does not exist" });
  }

  try {
    const notes = await getMarkdownFiles(vaultPath, vaultPath);
    res.json({ notes: notes.sort() });
  } catch (error) {
    res.status(500).json({ error: "Failed to read vault" });
  }
});

// Get all folders from Obsidian vault
app.get("/api/obsidian/folders", async (req, res) => {
  if (!db.data?.settings?.obsidianVaultPath) {
    return res.status(400).json({ error: "Obsidian vault path not configured" });
  }

  const vaultPath = resolveVaultPath(db.data.settings.obsidianVaultPath);
  
  if (!existsSync(vaultPath)) {
    return res.status(404).json({ error: "Vault path does not exist" });
  }

  try {
    const folders = await getFolders(vaultPath, vaultPath);
    res.json({ folders: ['', ...folders.sort()] }); // Include root folder as empty string
  } catch (error) {
    res.status(500).json({ error: "Failed to read vault folders" });
  }
});

// Create a new note in Obsidian vault
app.post("/api/obsidian/notes", async (req, res) => {
  const { title, folder } = req.body;

  if (!db.data?.settings?.obsidianVaultPath) {
    return res.status(400).json({ error: "Obsidian vault path not configured" });
  }

  if (!title) {
    return res.status(400).json({ error: "Note title is required" });
  }

  const vaultPath = resolveVaultPath(db.data.settings.obsidianVaultPath);
  
  if (!existsSync(vaultPath)) {
    return res.status(404).json({ error: "Vault path does not exist" });
  }

  // Use provided folder or default folder from settings
  const targetFolder = folder ?? db.data.settings.obsidianDefaultFolder ?? '';
  
  // Sanitize filename (remove invalid characters)
  const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '').trim();
  const fileName = `${sanitizedTitle}.md`;
  
  // Build full path
  const folderPath = targetFolder ? join(vaultPath, targetFolder) : vaultPath;
  const filePath = join(folderPath, fileName);
  const relativePath = targetFolder ? join(targetFolder, fileName) : fileName;

  // Check if file already exists
  if (existsSync(filePath)) {
    return res.status(409).json({ error: "Note already exists", path: relativePath });
  }

  try {
    // Create folder if it doesn't exist
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    // Create the note with basic content
    const content = `# ${title}\n\n`;
    await writeFile(filePath, content, 'utf-8');

    res.status(201).json({ path: relativePath });
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Check if vault path is valid
app.post("/api/obsidian/validate-path", async (req, res) => {
  const { path } = req.body;

  if (!path) {
    return res.status(400).json({ valid: false, error: "Path is required" });
  }

  const resolvedPath = resolveVaultPath(path);
  
  try {
    const stats = await stat(resolvedPath);
    if (stats.isDirectory()) {
      // Check if it looks like an Obsidian vault (has .obsidian folder)
      const isObsidianVault = existsSync(join(resolvedPath, '.obsidian'));
      res.json({ valid: true, isObsidianVault, resolvedPath });
    } else {
      res.json({ valid: false, error: "Path is not a directory" });
    }
  } catch {
    res.json({ valid: false, error: "Path does not exist" });
  }
});

app.listen(PORT, () => {
  console.log(`비움 (bium) Backend running on http://localhost:${PORT}`);
});
