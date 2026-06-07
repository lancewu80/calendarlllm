import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useCalendar } from '../context/CalendarContext';
import EventItem from '../components/EventItem';
import TaskItem from '../components/TaskItem';
import EventForm from '../components/EventForm';
import TaskForm from '../components/TaskForm';
import { Colors } from '../utils/colors';
import { formatDate, getWeekDays, getEventsForDate, getTasksForDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function WeekView() {
  const { currentDate, events, tasks, addEvent, updateEvent, deleteEvent, addTask, updateTask, deleteTask, toggleTask } = useCalendar();
  const weekDays = getWeekDays(currentDate);
  const [selectedDay, setSelectedDay] = useState(weekDays[0] || new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const dateStr = formatDate(selectedDay);
  const selectedEvents = getEventsForDate(events, selectedDay);
  const selectedTasks = getTasksForDate(tasks, selectedDay);

  const weekLabel = `${format(weekDays[0], 'M/d')} - ${format(weekDays[6], 'M/d')}`;

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSubmitEvent = (data) => {
    if (editingEvent) updateEvent(editingEvent.id, data);
    else addEvent(data);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleSubmitTask = (data) => {
    if (editingTask) updateTask(editingTask.id, data);
    else addTask(data);
  };

  const isToday = (d) => formatDate(d) === formatDate(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekLabel}>{weekLabel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {weekDays.map((day, index) => {
            const active = formatDate(day) === formatDate(selectedDay);
            const dayEvents = getEventsForDate(events, day);
            const dayTasks = getTasksForDate(tasks, day);
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayCard, active && styles.dayCardActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.dayName, active && styles.dayTextActive]}>
                  {['一', '二', '三', '四', '五', '六', '日'][index]}
                </Text>
                <Text style={[styles.dayNum, isToday(day) && styles.today, active && styles.dayTextActive]}>
                  {day.getDate()}
                </Text>
                {(dayEvents.length > 0 || dayTasks.length > 0) && (
                  <View style={styles.dot}>
                    <Text style={styles.dotText}>{dayEvents.length + dayTasks.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {format(selectedDay, 'M月d日 EEEE', { locale: zhTW })} 事件
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
              <Text style={styles.addBtnText}>+ 事件</Text>
            </TouchableOpacity>
          </View>
          {selectedEvents.length === 0 ? (
            <Text style={styles.emptyText}>無事件</Text>
          ) : (
            selectedEvents.map((event) => (
              <TouchableOpacity key={event.id} onLongPress={() => {
                Alert.alert('刪除事件', `確定刪除「${event.title}」？`, [
                  { text: '取消', style: 'cancel' },
                  { text: '刪除', style: 'destructive', onPress: () => deleteEvent(event.id) },
                ]);
              }}>
                <EventItem event={event} onPress={handleEditEvent} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>任務</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingTask(null); setShowTaskForm(true); }}>
              <Text style={styles.addBtnText}>+ 任務</Text>
            </TouchableOpacity>
          </View>
          {selectedTasks.length === 0 ? (
            <Text style={styles.emptyText}>無任務</Text>
          ) : (
            selectedTasks.map((task) => (
              <TouchableOpacity key={task.id} onLongPress={() => {
                Alert.alert('刪除任務', `確定刪除「${task.title}」？`, [
                  { text: '取消', style: 'cancel' },
                  { text: '刪除', style: 'destructive', onPress: () => deleteTask(task.id) },
                ]);
              }}>
                <TaskItem task={task} onPress={handleEditTask} onToggle={toggleTask} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <EventForm
        visible={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSubmit={handleSubmitEvent}
        event={editingEvent}
        date={dateStr}
      />
      <TaskForm
        visible={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onSubmit={handleSubmitTask}
        task={editingTask}
        date={dateStr}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  weekHeader: {
    backgroundColor: Colors.card,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  weekLabel: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  daysScroll: {
    paddingHorizontal: 8,
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.background,
    minWidth: 50,
  },
  dayCardActive: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  dayTextActive: {
    color: '#FFF',
  },
  today: {
    color: Colors.primary,
    fontWeight: '700',
  },
  dot: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 3,
  },
  dotText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 16,
  },
});
