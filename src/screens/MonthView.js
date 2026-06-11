import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useCalendar } from '../context/CalendarContext';
import { Colors } from '../utils/colors';
import { formatDate, getMarkedDates, getEventsForDate, getTasksForDate } from '../utils/dateUtils';
import { getLunarDateStr, getLunarFullStr } from '../utils/lunarUtils';
import { getHolidaysForDate, HolidayColors } from '../utils/holidays';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import EventItem from '../components/EventItem';
import TaskItem from '../components/TaskItem';
import EventForm from '../components/EventForm';
import TaskForm from '../components/TaskForm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_CELL_WIDTH = Math.floor((SCREEN_WIDTH - 16) / 7);

export default function MonthView() {
  const {
    currentDate, setCurrentDate,
    events, tasks, toggleTask,
    addEvent, updateEvent, deleteEvent,
    addTask, updateTask, deleteTask,
  } = useCalendar();

  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm,  setShowTaskForm]  = useState(false);
  const [editingEvent,  setEditingEvent]  = useState(null);
  const [editingTask,   setEditingTask]   = useState(null);

  const markedDates   = getMarkedDates(events, tasks);
  const todayStr      = formatDate(new Date());
  const selectedStr   = formatDate(currentDate);

  // ── 月份導航 ────────────────────────────────────────────────
  // 不使用 current prop 控制 Calendar（會造成鎖月 bug）。
  // 改用 initialDate（只設定初始月份），並用 onMonthChange 追蹤使用者翻頁。
  // currentDate 只存「選中的日期」，不干涉月份顯示。
  const initialDateStr = (() => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}-01`;
  })();

  const selectedEvents = getEventsForDate(events, currentDate);
  const selectedTasks  = getTasksForDate(tasks, currentDate);

  const onDayPress = (date) => {
    setCurrentDate(new Date(date.dateString + 'T00:00:00'));
  };

  const onMonthChange = (monthData) => {
    // 使用者翻頁時不做任何事 — 讓 Calendar 自己管理月份顯示
  };

  // ── 事件處理 ────────────────────────────────────────────────
  const handleAddEvent = () => { setEditingEvent(null); setShowEventForm(true); };
  const handleEditEvent = (event) => { setEditingEvent(event); setShowEventForm(true); };
  const handleDeleteEvent = (event) => {
    Alert.alert('刪除事件', `確定刪除「${event.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteEvent(event.id) },
    ]);
  };
  const handleSubmitEvent = (data) => {
    if (editingEvent) updateEvent(editingEvent.id, data);
    else addEvent(data);
  };

  // ── 任務處理 ────────────────────────────────────────────────
  const handleAddTask  = () => { setEditingTask(null); setShowTaskForm(true); };
  const handleEditTask = (task) => { setEditingTask(task); setShowTaskForm(true); };
  const handleDeleteTask = (task) => {
    Alert.alert('刪除任務', `確定刪除「${task.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  };
  const handleSubmitTask = (data) => {
    if (editingTask) updateTask(editingTask.id, data);
    else addTask(data);
  };

  // ── 自訂日期格 ──────────────────────────────────────────────
  const renderDay = ({ date, state, marking }) => {
    if (!date) return <View style={styles.dayCell} />;

    const isSelected   = date.dateString === selectedStr;
    const isToday      = date.dateString === todayStr;
    const isDisabled   = state === 'disabled';
    const hasDot       = marking && (marking.marked || (marking.dots && marking.dots.length > 0));
    const lunarStr     = getLunarDateStr(date.year, date.month, date.day);
    const isLunarFirst = lunarStr.endsWith('月');
    const holidays     = getHolidaysForDate(date.year, date.month, date.day);
    const topHoliday   = holidays[0];

    return (
      <TouchableOpacity
        onPress={() => onDayPress(date)}
        style={[styles.dayCell, isSelected && styles.dayCellSelected]}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayNum,
          isToday    && styles.dayNumToday,
          isSelected && styles.dayNumSelected,
          isDisabled && styles.dayNumDisabled,
        ]}>
          {date.day}
        </Text>
        <Text style={[
          styles.lunarText,
          isLunarFirst && styles.lunarFirstDay,
          isSelected   && styles.lunarTextSelected,
          isDisabled   && styles.lunarTextDisabled,
        ]} numberOfLines={1}>
          {lunarStr}
        </Text>
        {topHoliday && !isDisabled && (
          <Text style={[
            styles.holidayCellLabel,
            topHoliday.type === 'TW'    && styles.holidayCellTW,
            topHoliday.type === 'US'    && styles.holidayCellUS,
            topHoliday.type === 'LUNAR' && styles.holidayCellLunar,
            isSelected && styles.holidayCellSelected,
          ]} numberOfLines={1}>
            {topHoliday.name}
          </Text>
        )}
        {hasDot && (
          <View style={styles.dotRow}>
            {(marking.dots || [{ color: marking.dotColor || Colors.eventDot }]).map((dot, idx) => (
              <View key={idx} style={[styles.dot, { backgroundColor: dot.color }]} />
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* 月曆 */}
        <View style={styles.calendarContainer}>
          <Calendar
            initialDate={initialDateStr}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            markingType="multi-dot"
            dayComponent={renderDay}
            theme={{
              backgroundColor        : Colors.card,
              calendarBackground     : Colors.card,
              arrowColor             : Colors.primary,
              monthTextColor         : Colors.text,
              textMonthFontWeight    : '700',
              textMonthFontSize      : 16,
              textDayHeaderFontSize  : 12,
              textDayHeaderFontWeight: '600',
              textSectionTitleColor  : Colors.textSecondary,
              'stylesheet.calendar.header': {
                week: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
              },
            }}
            renderHeader={(date) => (
              <Text style={styles.monthTitle}>
                {format(new Date(date), 'yyyy年 M月')}
              </Text>
            )}
          />
        </View>

        {/* 選定日期 + 操作按鈕 */}
        <View style={styles.selectedInfo}>
          <View style={styles.selectedHeader}>
            <View>
              <Text style={styles.selectedDate}>
                {format(currentDate, 'M月d日 EEEE', { locale: zhTW })}
              </Text>
              <Text style={styles.selectedLunar}>
                {getLunarFullStr(
                  currentDate.getFullYear(),
                  currentDate.getMonth() + 1,
                  currentDate.getDate()
                )}
              </Text>
            </View>
            <Text style={styles.selectedCount}>
              {selectedEvents.length} 事件 · {selectedTasks.length} 任務
            </Text>
          </View>

          {/* 節假日 badges */}
          {(() => {
            const hols = getHolidaysForDate(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              currentDate.getDate()
            );
            if (!hols.length) return null;
            return (
              <View style={styles.holidayBadgesRow}>
                {hols.map((h, i) => (
                  <View
                    key={i}
                    style={[styles.holidayBadge, { backgroundColor: HolidayColors[h.type].bg }]}
                  >
                    <Text style={[styles.holidayBadgeText, { color: HolidayColors[h.type].text }]}>
                      {HolidayColors[h.type].label} {h.name}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })()}

          {/* 新增按鈕列 */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionEventBtn} onPress={handleAddEvent}>
              <Text style={styles.actionEventText}>＋ 新增事件</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionTaskBtn} onPress={handleAddTask}>
              <Text style={styles.actionTaskText}>＋ 新增任務</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 事件列表 */}
        {selectedEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>事件</Text>
            {selectedEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => handleEditEvent(event)}
                onLongPress={() => handleDeleteEvent(event)}
              >
                <EventItem event={event} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 任務列表 */}
        {selectedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>任務</Text>
            {selectedTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => handleEditTask(task)}
                onLongPress={() => handleDeleteTask(task)}
              >
                <TaskItem task={task} onToggle={toggleTask} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedEvents.length === 0 && selectedTasks.length === 0 && (
          <Text style={styles.emptyText}>這天還沒有事件或任務</Text>
        )}
      </ScrollView>

      <EventForm
        visible={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSubmit={handleSubmitEvent}
        event={editingEvent}
        date={selectedStr}
      />
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleSubmitTask}
        task={editingTask}
        date={selectedStr}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendarContainer: {
    backgroundColor : Colors.card,
    paddingBottom   : 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthTitle: {
    fontSize      : 17,
    fontWeight    : '700',
    color         : Colors.text,
    paddingVertical: 8,
  },

  // ── 日期格 ───────────────────────────────────────────────────
  dayCell: {
    width          : DAY_CELL_WIDTH,
    alignItems     : 'center',
    paddingVertical: 4,
    borderRadius   : 10,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayNum: {
    fontSize  : 15,
    fontWeight: '600',
    color     : Colors.text,
  },
  dayNumToday: {
    color     : Colors.primary,
    fontWeight: '800',
  },
  dayNumSelected: {
    color: '#FFF',
  },
  dayNumDisabled: {
    color: Colors.border,
  },
  lunarText: {
    fontSize : 9,
    color    : Colors.textSecondary,
    marginTop: 1,
  },
  lunarFirstDay: {
    color     : Colors.primary,
    fontWeight: '600',
  },
  lunarTextSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  lunarTextDisabled: {
    color: Colors.border,
  },
  dotRow: {
    flexDirection: 'row',
    marginTop    : 2,
    gap          : 2,
  },
  dot: {
    width       : 4,
    height      : 4,
    borderRadius: 2,
  },

  // ── 選定日期資訊 ─────────────────────────────────────────────
  selectedInfo: {
    backgroundColor  : Colors.card,
    paddingHorizontal: 16,
    paddingTop       : 12,
    paddingBottom    : 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedHeader: {
    flexDirection : 'row',
    justifyContent: 'space-between',
    alignItems    : 'flex-start',
    marginBottom  : 10,
  },
  selectedDate: {
    fontSize  : 15,
    fontWeight: '600',
    color     : Colors.text,
  },
  selectedLunar: {
    fontSize : 12,
    color    : Colors.textSecondary,
    marginTop: 2,
  },
  selectedCount: {
    fontSize  : 13,
    color     : Colors.textSecondary,
    marginTop : 2,
  },

  // ── 新增按鈕 ─────────────────────────────────────────────────
  actionRow: {
    flexDirection: 'row',
    gap          : 10,
  },
  actionEventBtn: {
    flex            : 1,
    backgroundColor : Colors.primaryLight,
    paddingVertical : 8,
    borderRadius    : 10,
    alignItems      : 'center',
  },
  actionEventText: {
    color     : Colors.primary,
    fontSize  : 13,
    fontWeight: '600',
  },
  actionTaskBtn: {
    flex           : 1,
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    borderRadius   : 10,
    alignItems     : 'center',
  },
  actionTaskText: {
    color     : Colors.warning,
    fontSize  : 13,
    fontWeight: '600',
  },

  // ── 節假日標籤（月曆格內） ────────────────────────────────────
  holidayCellLabel: {
    fontSize  : 8,
    marginTop : 1,
    fontWeight: '500',
    textAlign : 'center',
  },
  holidayCellTW    : { color: '#C62828' },
  holidayCellUS    : { color: '#1565C0' },
  holidayCellLunar : { color: '#BF360C' },
  holidayCellSelected: { color: 'rgba(255,255,255,0.9)' },

  // ── 節假日 badges（選定日資訊欄） ─────────────────────────────
  holidayBadgesRow: {
    flexDirection: 'row',
    flexWrap     : 'wrap',
    gap          : 6,
    marginBottom : 8,
  },
  holidayBadge: {
    paddingHorizontal: 8,
    paddingVertical  : 3,
    borderRadius     : 10,
  },
  holidayBadgeText: {
    fontSize  : 11,
    fontWeight: '600',
  },

  // ── 事件/任務列表 ─────────────────────────────────────────────
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize        : 16,
    fontWeight      : '700',
    color           : Colors.text,
    paddingHorizontal: 16,
    marginBottom    : 8,
  },
  emptyText: {
    textAlign     : 'center',
    color         : Colors.textSecondary,
    fontSize      : 14,
    marginVertical: 30,
  },
});
