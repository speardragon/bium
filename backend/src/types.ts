// Type definitions for 비움 (bium)

// Queue 타입 정의 - 실제 Queue의 정체성 (Deep Work, Admin 등)
export interface Queue {
  id: string;
  title: string;
  color: string;
  tasks: string[]; // 이 Queue에 할당된 Task IDs (사전순 정렬은 API에서 처리)
}

// Queue가 배치되는 시간대 템플릿
export interface QueueTemplate {
  id: string;
  queueId: string;      // Queue.id 참조
  dayOfWeek: number;    // 1=Monday, 2=Tuesday, ..., 5=Friday
  startTime: string;    // "09:00"
  endTime: string;      // "11:00"
}

export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'inbox' | 'assigned' | 'completed';
  assignedQueueId: string | null;  // 할당된 Queue ID
  completedAt: string | null;      // 완료 시각 (ISO string)
}

export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

export interface Settings {
  language: SupportedLanguage;
}

export interface Database {
  queues: Queue[];
  queueTemplates: QueueTemplate[];
  tasks: Task[];
  settings: Settings;
}
