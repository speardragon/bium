// Get current week key in ISO format (YYYY-Www)
export function getCurrentWeekKey(): string {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - yearStart.getTime()) / 86400000);
  const weekNum = Math.ceil((dayOfYear + yearStart.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

// Get dates for current week (Monday to Friday)
export function getWeekDates(): { date: string; dayOfWeek: number; dayName: string; isToday: boolean }[] {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const result = [];
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      dayOfWeek: i + 1, // 1=Monday, 2=Tuesday, etc.
      dayName: days[i],
      isToday: dateStr === todayStr
    });
  }
  
  return result;
}

// Calculate time duration in minutes from start and end time strings
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

// Format minutes to readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Calculate fill percentage for a queue
export function calculateFillPercentage(usedMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 0;
  return Math.round((usedMinutes / totalMinutes) * 100);
}

// Get fill status class based on percentage
export function getFillStatus(percentage: number): 'safe' | 'warning' | 'danger' {
  if (percentage <= 70) return 'safe';
  if (percentage <= 100) return 'warning';
  return 'danger';
}

// Get fill color based on status
export function getFillColor(status: 'safe' | 'warning' | 'danger'): string {
  switch (status) {
    case 'safe': return '#3B82F6';
    case 'warning': return '#F59E0B';
    case 'danger': return '#EF4444';
  }
}
