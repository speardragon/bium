import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { Database } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve ~ to home directory
function resolvePath(path: string): string {
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  if (path === "~") {
    return homedir();
  }
  return path;
}

// Data path: 환경변수 DATA_PATH 또는 기본값 (프로젝트 내 data 폴더)
const DATA_PATH = process.env.DATA_PATH 
  ? resolvePath(process.env.DATA_PATH)
  : join(__dirname, "..", "data");

// 데이터 디렉토리가 없으면 생성
if (!existsSync(DATA_PATH)) {
  mkdirSync(DATA_PATH, { recursive: true });
}

// Default data - 새로운 구조
const defaultData: Database = {
  // Queue 타입 정의 (Deep Work, Admin 등)
  queues: [
    {
      id: "q_deepwork",
      title: "Deep Work",
      color: "#3B82F6",
      tasks: [],
    },
    {
      id: "q_admin",
      title: "Admin",
      color: "#10B981",
      tasks: [],
    },
    {
      id: "q_creative",
      title: "Creative",
      color: "#8B5CF6",
      tasks: [],
    },
  ],
  // Queue가 배치되는 시간대 (요일별)
  queueTemplates: [
    // Deep Work: 월/수/금 09:00-11:00
    {
      id: "qt_001",
      queueId: "q_deepwork",
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "11:00",
    },
    {
      id: "qt_002",
      queueId: "q_deepwork",
      dayOfWeek: 3, // Wednesday
      startTime: "09:00",
      endTime: "11:00",
    },
    {
      id: "qt_003",
      queueId: "q_deepwork",
      dayOfWeek: 5, // Friday
      startTime: "09:00",
      endTime: "11:00",
    },
    // Admin: 화/목 14:00-16:00
    {
      id: "qt_004",
      queueId: "q_admin",
      dayOfWeek: 2, // Tuesday
      startTime: "14:00",
      endTime: "16:00",
    },
    {
      id: "qt_005",
      queueId: "q_admin",
      dayOfWeek: 4, // Thursday
      startTime: "14:00",
      endTime: "16:00",
    },
    // Creative: 월 14:00-16:00
    {
      id: "qt_006",
      queueId: "q_creative",
      dayOfWeek: 1, // Monday
      startTime: "14:00",
      endTime: "16:00",
    },
  ],
  tasks: [
    {
      id: "t_001",
      title: "Write Blog Post",
      durationMinutes: 60,
      status: "inbox",
      assignedQueueId: null,
      completedAt: null,
    },
    {
      id: "t_002",
      title: "Prepare Presentation",
      durationMinutes: 90,
      status: "inbox",
      assignedQueueId: null,
      completedAt: null,
    },
    {
      id: "t_003",
      title: "Client Meeting Prep",
      durationMinutes: 45,
      status: "inbox",
      assignedQueueId: null,
      completedAt: null,
    },
    {
      id: "t_004",
      title: "Review Code",
      durationMinutes: 30,
      status: "inbox",
      assignedQueueId: null,
      completedAt: null,
    },
    {
      id: "t_005",
      title: "Email Cleanup",
      durationMinutes: 30,
      status: "inbox",
      assignedQueueId: null,
      completedAt: null,
    },
  ],
  settings: {
    language: "en",
  },
};

// Database file path
const file = join(DATA_PATH, "db.json");
console.log(`Data path: ${file}`);

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
