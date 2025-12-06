import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Database } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Default data
const defaultData: Database = {
  queues: [
    {
      id: 'q_001',
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '11:00',
      title: 'Deep Work',
      color: '#3B82F6'
    },
    {
      id: 'q_002',
      dayOfWeek: 1,
      startTime: '13:00',
      endTime: '15:00',
      title: '1-3 PM',
      color: '#10B981'
    },
    {
      id: 'q_003',
      dayOfWeek: 2,
      startTime: '14:00',
      endTime: '16:00',
      title: 'Urgent Report',
      color: '#EF4444'
    },
    {
      id: 'q_004',
      dayOfWeek: 3,
      startTime: '09:00',
      endTime: '11:00',
      title: 'Deep Work Queue',
      color: '#3B82F6'
    },
    {
      id: 'q_005',
      dayOfWeek: 4,
      startTime: '09:00',
      endTime: '11:00',
      title: 'Admin Queue',
      color: '#6B7280'
    },
    {
      id: 'q_006',
      dayOfWeek: 5,
      startTime: '09:00',
      endTime: '11:00',
      title: '9-11 AM',
      color: '#10B981'
    }
  ],
  tasks: [
    {
      id: 't_001',
      title: 'Write Blog Post',
      durationMinutes: 60,
      status: 'inbox',
      assignedTo: null
    },
    {
      id: 't_002',
      title: 'Prepare Presentation',
      durationMinutes: 90,
      status: 'inbox',
      assignedTo: null
    },
    {
      id: 't_003',
      title: 'Client Meeting Prep',
      durationMinutes: 45,
      status: 'inbox',
      assignedTo: null
    },
    {
      id: 't_004',
      title: 'Review Code',
      durationMinutes: 30,
      status: 'inbox',
      assignedTo: null
    },
    {
      id: 't_005',
      title: 'Email Cleanup',
      durationMinutes: 30,
      status: 'inbox',
      assignedTo: null
    }
  ],
  weeklyPlan: {}
};

// Database file path
const file = join(__dirname, '..', 'data', 'db.json');

// Configure lowdb
const adapter = new JSONFile<Database>(file);
const db = new Low<Database>(adapter);

export async function initDb(): Promise<Low<Database>> {
  await db.read();
  // If db.json doesn't exist or is empty, initialize with default data
  if (!db.data) {
    db.data = defaultData;
    await db.write();
  }
  return db;
}

export { db };
