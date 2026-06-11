import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useCalendar } from '../context/CalendarContext';
import { Colors } from '../utils/colors';
import { formatDate } from '../utils/dateUtils';
import { getLunarYearStr } from '../utils/lunarUtils';
import EventForm from '../components/EventForm';
import TaskForm from '../components/TaskForm';

const MONTHS = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export default function YearView() {
  const {
    currentDate, setCurrentDate,
    events, tasks,
    addEvent, addTask,
  } = useCalendar();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm,  setShowTaskForm]  = useState(false);

  const year = currentDate.getFullYear();

  const monthStats = useMemo(() => {
    return MONTHS.map((_, i) => {
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
    setCurrentDate(new Date(year, monthIndex, 1));
  };

  // 新增事件：使用 currentDate（月份卡點擊後已更新）
  const handleSubmitEvent = (data) => addEvent(data);
  const handleSubmitTask  = (data) => addTask(data);

  const formDate = formatDate(currentDate);

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container}>
        {/* 年份標題 */}
        <View style={styles.yearTitleBlock}>
          <Text style={styles.yearTitle}>{year} 年</Text>
          <Text style={styles.lunarYearTitle}>{getLunarYearStr(year)}</Text>
        </View>

        {/* 月份格 */}
        <View style={styles.grid}>
          {MONTHS.map((month, i) => {
            const stats = monthStats[i];
            const isCurrentMonth =
              i === new Date().getMonth() && year === new Date().getFullYear();
            const isSelected =
              i === currentDate.getMonth() && year === currentDate.getFullYear();
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.monthCard,
                  isCurrentMonth && styles.currentMonth,
                  isSelected && !isCurrentMonth && styles.selectedMonth,
                ]}
                onPress={() => handleMonthPress(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.monthName, isCurrentMonth && styles.monthNameCurrent]}>
                  {month}
                </Text>
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

        {/* 底部間距，避免被 FAB 遮住 */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 懸浮新增按鈕 */}
      <View style={styles.fabRow}>
        <TouchableOpacity
          style={[styles.fabBtn, styles.fabEventBtn]}
          onPress={() => setShowEventForm(true)}
        >
          <Text style={styles.fabEventText}>＋ 新增事件</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabBtn, styles.fabTaskBtn]}
          onPress={() => setShowTaskForm(true)}
        >
          <Text style={styles.fabTaskText}>＋ 新增任務</Text>
        </TouchableOpacity>
      </View>

      <EventForm
        visible={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSubmit={handleSubmitEvent}
        event={null}
        date={formDate}
      />
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleSubmitTask}
        task={null}
        date={formDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },

  // ── 年份標題 ─────────────────────────────────────────────────
  yearTitleBlock: {
    alignItems    : 'center',
    paddingVertical: 16,
  },
  yearTitle: {
    fontSize  : 26,
    fontWeight: '800',
    color     : Colors.text,
  },
  lunarYearTitle: {
    fontSize  : 14,
    fontWeight: '600',
    color     : Colors.primary,
    marginTop : 4,
  },

  // ── 月份格 ───────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap     : 'wrap',
    paddingHorizontal: 12,
  },
  monthCard: {
    width          : '46%',
    margin         : '2%',
    backgroundColor: Colors.card,
    borderRadius   : 14,
    padding        : 16,
    alignItems     : 'center',
    shadowColor    : '#000',
    shadowOffset   : { width: 0, height: 1 },
    shadowOpacity  : 0.08,
    shadowRadius   : 4,
    elevation      : 2,
    borderWidth    : 2,
    borderColor    : 'transparent',
  },
  currentMonth: {
    borderColor: Colors.primary,
  },
  selectedMonth: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
  },
  monthName: {
    fontSize  : 17,
    fontWeight: '700',
    color     : Colors.text,
    marginBottom: 8,
  },
  monthNameCurrent: {
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems   : 'center',
    gap          : 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems   : 'center',
  },
  statDot: {
    width       : 8,
    height      : 8,
    borderRadius: 4,
    marginRight : 4,
  },
  statText: {
    fontSize  : 13,
    color     : Colors.textSecondary,
    fontWeight: '600',
  },
  noData: {
    fontSize: 14,
    color   : Colors.border,
  },

  // ── 懸浮按鈕 ─────────────────────────────────────────────────
  fabRow: {
    position        : 'absolute',
    bottom          : 16,
    left            : 16,
    right           : 16,
    flexDirection   : 'row',
    gap             : 12,
  },
  fabBtn: {
    flex           : 1,
    paddingVertical: 13,
    borderRadius   : 14,
    alignItems     : 'center',
    shadowColor    : '#000',
    shadowOffset   : { width: 0, height: 3 },
    shadowOpacity  : 0.15,
    shadowRadius   : 6,
    elevation      : 5,
  },
  fabEventBtn: {
    backgroundColor: Colors.primary,
  },
  fabEventText: {
    color     : '#FFF',
    fontSize  : 15,
    fontWeight: '700',
  },
  fabTaskBtn: {
    backgroundColor: Colors.warning,
  },
  fabTaskText: {
    color     : '#FFF',
    fontSize  : 15,
    fontWeight: '700',
  },
});
