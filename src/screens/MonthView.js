import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useCalendar } from '../context/CalendarContext';
import { Colors } from '../utils/colors';
import { formatDate, getMarkedDates, getEventsForDate, getTasksForDate } from '../utils/dateUtils';
import { format } from 'date-fns';
import EventItem from '../components/EventItem';
import TaskItem from '../components/TaskItem';
import { zhTW } from 'date-fns/locale';

export default function MonthView({ navigation }) {
  const { currentDate, setCurrentDate, events, tasks, toggleTask } = useCalendar();

  const markedDates = getMarkedDates(events, tasks);
  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(currentDate);

  markedDates[selectedStr] = {
    ...(markedDates[selectedStr] || {}),
    selected: true,
    selectedColor: Colors.primary,
    selectedTextColor: '#FFF',
  };

  const selectedEvents = getEventsForDate(events, currentDate);
  const selectedTasks = getTasksForDate(tasks, currentDate);

  const onDayPress = (day) => {
    setCurrentDate(new Date(day.dateString + 'T00:00:00'));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedStr}
          onDayPress={onDayPress}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            backgroundColor: Colors.card,
            calendarBackground: Colors.card,
            todayTextColor: Colors.primary,
            selectedDayBackgroundColor: Colors.primary,
            selectedDayTextColor: '#FFF',
            arrowColor: Colors.primary,
            monthTextColor: Colors.text,
            textMonthFontWeight: '700',
            textDayFontSize: 15,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13,
            textDayHeaderFontWeight: '600',
            dayTextColor: Colors.text,
            textDisabledColor: Colors.border,
            'stylesheet.calendar.header': {
              week: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingVertical: 8,
              },
            },
          }}
          renderHeader={(date) => {
            const d = new Date(date);
            return (
              <Text style={styles.monthTitle}>
                {format(d, 'yyyy年 M月')}
              </Text>
            );
          }}
        />
      </View>

      <View style={styles.selectedInfo}>
        <View style={styles.selectedHeader}>
          <Text style={styles.selectedDate}>
            {format(currentDate, 'M月d日 EEEE', { locale: zhTW })}
          </Text>
          <Text style={styles.selectedCount}>
            {selectedEvents.length} 事件 · {selectedTasks.length} 任務
          </Text>
        </View>
      </View>

      {selectedEvents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>事件</Text>
          {selectedEvents.map((event) => (
            <EventItem key={event.id} event={event} />
          ))}
        </View>
      )}

      {selectedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>任務</Text>
          {selectedTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </View>
      )}

      {selectedEvents.length === 0 && selectedTasks.length === 0 && (
        <Text style={styles.emptyText}>這天還沒有事件或任務</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  calendarContainer: {
    backgroundColor: Colors.card,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    paddingVertical: 8,
  },
  selectedInfo: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  selectedCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 12,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginVertical: 30,
  },
});
