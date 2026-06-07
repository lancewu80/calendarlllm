import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isSameDay, isSameMonth, isSameYear, parseISO, addMonths, addWeeks, addYears, subMonths, subWeeks, subYears } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const DAY_VIEW = 'day';
export const WEEK_VIEW = 'week';
export const MONTH_VIEW = 'month';
export const YEAR_VIEW = 'year';

export const PRIORITY_HIGH = 'high';
export const PRIORITY_MEDIUM = 'medium';
export const PRIORITY_LOW = 'low';

export const PRIORITY_LABELS = {
  [PRIORITY_HIGH]: { label: '高', color: '#E53935', order: 0 },
  [PRIORITY_MEDIUM]: { label: '中', color: '#FB8C00', order: 1 },
  [PRIORITY_LOW]: { label: '低', color: '#43A047', order: 2 },
};

export function formatDate(date) {
  return format(date, 'yyyy-MM-dd');
}

export function formatTime(date) {
  return format(date, 'HH:mm');
}

export function formatDateTime(date) {
  return format(date, 'yyyy-MM-dd HH:mm');
}

export function getWeekDays(date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

export function getMonthDays(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  return eachDayOfInterval({ start: monthStart, end: monthEnd });
}

export function getYearMonths(date) {
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);
  return eachDayOfInterval({ start: yearStart, end: yearEnd }).filter(
    (d, i, arr) => d.getDate() === 1 || i === arr.length - 1
  );
}

export function getEventsForDate(events, date) {
  const dateStr = formatDate(date);
  return events.filter((event) => {
    const eventDate = event.date || formatDate(parseISO(event.startTime));
    return eventDate === dateStr;
  });
}

export function getTasksForDate(tasks, date) {
  const dateStr = formatDate(date);
  return tasks
    .filter((task) => task.date === dateStr && !task.completed)
    .sort((a, b) => PRIORITY_LABELS[a.priority]?.order - PRIORITY_LABELS[b.priority]?.order);
}

export function getUpcomingTasks(tasks, limit = 10) {
  const today = formatDate(new Date());
  return tasks
    .filter((task) => task.date >= today && !task.completed)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return PRIORITY_LABELS[a.priority]?.order - PRIORITY_LABELS[b.priority]?.order;
    })
    .slice(0, limit);
}

export function getMarkedDates(events, tasks) {
  const marked = {};
  events.forEach((event) => {
    const d = event.date || formatDate(parseISO(event.startTime));
    if (!marked[d]) marked[d] = { marked: true, dotColor: '#4A90D9' };
  });
  tasks.forEach((task) => {
    if (!task.completed) {
      if (!marked[task.date]) marked[task.date] = { marked: true, dotColor: '#E53935' };
      else marked[task.date].dots = [
        { color: '#4A90D9' },
        { color: '#E53935' },
      ];
    }
  });
  return marked;
}

export function navigateDate(date, view, direction) {
  const fn = direction > 0
    ? { day: (d) => new Date(d.getTime() + 86400000), week: addWeeks, month: addMonths, year: addYears }
    : { day: (d) => new Date(d.getTime() - 86400000), week: subWeeks, month: subMonths, year: subYears };
  return fn[view](date, 1);
}
