import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useCalendar } from '../context/CalendarContext';
import { Colors } from '../utils/colors';
import {
  formatDate, format, getEventsForDate, getTasksForDate,
} from '../utils/dateUtils';

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export default function YearView() {
  const { currentDate, setCurrentDate, events, tasks } = useCalendar();
  const year = currentDate.getFullYear();

  const monthStats = useMemo(() => {
    return MONTHS.map((_, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEvents = events.filter((e) => {
        const d = new Date(e.date || e.startTime);
        return d.getFullYear() === year && d.getMonth() === i;
      });
      const monthTasks = tasks.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === year && d.getMonth() === i && !t.completed;
      });
      return { events: monthEvents.length, tasks: monthTasks.length };
    });
  }, [year, events, tasks]);

  const handleMonthPress = (monthIndex) => {
    const newDate = new Date(year, monthIndex, 1);
    setCurrentDate(newDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.yearTitle}>{year} 年</Text>
      <View style={styles.grid}>
        {MONTHS.map((month, i) => {
          const stats = monthStats[i];
          const isCurrentMonth =
            i === new Date().getMonth() && year === new Date().getFullYear();
          return (
            <TouchableOpacity
              key={i}
              style={[styles.monthCard, isCurrentMonth && styles.currentMonth]}
              onPress={() => handleMonthPress(i)}
              activeOpacity={0.7}
            >
              <Text style={styles.monthName}>{month}</Text>
              <View style={styles.statsRow}>
                {stats.events > 0 && (
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: Colors.eventDot }]} />
                    <Text style={styles.statText}>{stats.events}</Text>
                  </View>
                )}
                {stats.tasks > 0 && (
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: Colors.taskDot }]} />
                    <Text style={styles.statText}>{stats.tasks}</Text>
                  </View>
                )}
                {stats.events === 0 && stats.tasks === 0 && (
                  <Text style={styles.noData}>-</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  yearTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    paddingVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  monthCard: {
    width: '46%',
    margin: '2%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  currentMonth: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  monthName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  noData: {
    fontSize: 14,
    color: Colors.border,
  },
});
