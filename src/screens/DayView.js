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
import { formatDate, getEventsForDate, getTasksForDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default function DayView() {
  const { currentDate, events, tasks, addEvent, updateEvent, deleteEvent, addTask, updateTask, deleteTask, toggleTask } = useCalendar();
  const [showEventForm, setShowEventForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const dateStr = formatDate(currentDate);
  const dayEvents = getEventsForDate(events, currentDate);
  const dayTasks = getTasksForDate(tasks, currentDate);

  const dayName = format(currentDate, 'EEEE', { locale: zhTW });
  const monthDay = format(currentDate, 'M月d日');

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (event) => {
    Alert.alert('刪除事件', `確定刪除「${event.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteEvent(event.id) },
    ]);
  };

  const handleSubmitEvent = (data) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, data);
    } else {
      addEvent(data);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (task) => {
    Alert.alert('刪除任務', `確定刪除「${task.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  };

  const handleSubmitTask = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.dayText}>{dayName} {monthDay}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>事件 ({dayEvents.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddEvent}>
              <Text style={styles.addBtnText}>+ 新增事件</Text>
            </TouchableOpacity>
          </View>
          {dayEvents.length === 0 ? (
            <Text style={styles.emptyText}>這天沒有事件</Text>
          ) : (
            dayEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                onLongPress={() => handleDeleteEvent(event)}
              >
                <EventItem event={event} onPress={handleEditEvent} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>任務 ({dayTasks.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingTask(null); setShowTaskForm(true); }}>
              <Text style={styles.addBtnText}>+ 新增任務</Text>
            </TouchableOpacity>
          </View>
          {dayTasks.length === 0 ? (
            <Text style={styles.emptyText}>這天沒有任務</Text>
          ) : (
            dayTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onLongPress={() => handleDeleteTask(task)}
              >
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
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  dayText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 20,
  },
});
