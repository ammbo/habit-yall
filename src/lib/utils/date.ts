// Format a date to a string
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format a date to a time string
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

// Format a date to a datetime string
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// Calculate the deadline for the next volley
export function calculateDeadline(
  completedAt: Date,
  maximumWindowHours: number
): Date {
  const deadline = new Date(completedAt);
  deadline.setHours(deadline.getHours() + maximumWindowHours);
  return deadline;
}

// Check if the current time is before the deadline
export function isBeforeDeadline(deadline: Date): boolean {
  return new Date() < new Date(deadline);
}

// Calculate the earliest time a volley can be checked off
export function calculateEarliestVolleyTime(
  completedAt: Date,
  minimumDelayHours: number
): Date {
  const earliestTime = new Date(completedAt);
  earliestTime.setHours(earliestTime.getHours() + minimumDelayHours);
  return earliestTime;
}

// Check if enough time has passed for the next volley
export function canCompleteVolley(
  lastVolleyTime: Date,
  minimumDelayHours: number
): boolean {
  const earliestTime = calculateEarliestVolleyTime(lastVolleyTime, minimumDelayHours);
  return new Date() >= earliestTime;
}

// Get a human-readable time remaining string
export function getTimeRemaining(deadline: Date): string {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  if (now > deadlineDate) {
    return 'Time expired';
  }
  
  const totalSeconds = Math.floor((deadlineDate.getTime() - now.getTime()) / 1000);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  
  if (minutes > 0) {
    return `${minutes}m remaining`;
  }
  
  return 'Less than a minute remaining';
} 