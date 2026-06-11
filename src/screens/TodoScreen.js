import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useCalendar } from '../context/CalendarContext';
import TaskItem from '../components/TaskItem';
import TaskForm from '../components/TaskForm';
import { Colors } from '../utils/colors';
import { getUpcomingTasks, formatDate } from '../utils/dateUtils';
import { getLunarFullWithYearStr } from '../utils/lunarUtils';
import { addDays } from 'date-fns';

export default function TodoScreen() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useCalendar();
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const today = formatDate(new Date());
  const tomorrow = formatDate(addDays(new Date(), 1));

  const groupedTasks = useMemo(() => {
    let filtered = tasks;

    if (filter === 'today') {
      filtered = tasks.filter((t) => t.date === today);
    } else if (filter === 'upcoming') {
      filtered = tasks.filter((t) => t.date >= today && !t.completed);
    } else if (filter === 'completed') {
      filtered = tasks.filter((t) => t.completed);
    } else {
      // all: active first, completed last
    }

    const active = filtered.filter((t) => !t.completed)
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        const prioCmp = (a.priority === 'high' ? 0 : a.priority === 'medium' ? 1 : 2) -
                        (b.priority === 'high' ? 0 : b.priority === 'medium' ? 1 : 2);
        return prioCmp;
      });

    const completed = filtered.filter((t) => t.completed)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { active, completed };
  }, [tasks, filter, today]);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSubmitTask = (data) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
  };

  const handleDeleteTask = (task) => {
    Alert.alert('刪除任務', `確定刪除「${task.title}」？`, [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: () => deleteTask(task.id) },
    ]);
  };

  const getDateLabel = (dateStr) => {
    if (dateStr === today) return '今天';
    if (dateStr === tomorrow) return '明天';
    return dateStr;
  };

  const getDateLunar = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return getLunarFullWithYearStr(y, m, d);
  };

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'today', label: '今天' },
    { key: 'upcoming', label: '待辦' },
    { key: 'completed', label: '已完成' },
  ];

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Group active tasks by date
  const groupedByDate = {};
  groupedTasks.active.forEach((t) => {
    if (!groupedByDate[t.date]) groupedByDate[t.date] = [];
    groupedByDate[t.date].push(t);
  });

  return (
    <View style={styles.container}>
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>待辦 {activeCount} · 已完成 {completedCount}</Text>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.list}>
        {filter !== 'completed' && groupedTasks.active.length === 0 && (
          <Text style={styles.emptyText}>沒有待辦任務</Text>
        )}

        {filter !== 'completed' && Object.keys(groupedByDate)
          .sort()
          .map((dateStr) => (
            <View key={dateStr}>
              <View style={styles.dateGroupHeader}>
                <View>
                  <Text style={styles.dateGroupLabel}>{getDateLabel(dateStr)}</Text>
                  <Text style={styles.dateGroupLunar}>{getDateLunar(dateStr)}</Text>
                </View>
                <Text style={styles.dateGroupCount}>{groupedByDate[dateStr].length} 項</Text>
              </View>
              {groupedByDate[dateStr].map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onLongPress={() => handleDeleteTask(task)}
                >
                  <TaskItem task={task} onPress={handleEditTask} onToggle={toggleTask} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

        {filter === 'completed' && groupedTasks.completed.length > 0 && (
          <View>
            <View style={styles.dateGroupHeader}>
              <Text style={styles.dateGroupLabel}>已完成</Text>
              <Text style={styles.dateGroupCount}>{groupedTasks.completed.length} 項</Text>
            </View>
            {groupedTasks.completed.map((task) => (
              <TouchableOpacity
                key={task.id}
                onLongPress={() => handleDeleteTask(task)}
              >
                <TaskItem task={task} onPress={handleEditTask} onToggle={toggleTask} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filter === 'completed' && groupedTasks.completed.length === 0 && (
          <Text style={styles.emptyText}>沒有已完成的任務</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => { setEditingTask(null); setShowForm(true); }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TaskForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmitTask}
        task={editingTask}
        date={formatDate(new Date())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsBar: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterRow: {
    backgroundColor: Colors.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: Colors.background,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  list: {
    flex: 1,
    paddingTop: 8,
  },
  dateGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  dateGroupLabel: {
    fontSize  : 14,
    fontWeight: '700',
    color     : Colors.text,
  },
  dateGroupLunar: {
    fontSize : 11,
    color    : Colors.textSecondary,
    marginTop: 1,
  },
  dateGroupCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
    marginVertical: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: '#FFF',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
});
