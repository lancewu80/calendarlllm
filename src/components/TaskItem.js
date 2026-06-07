import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, PriorityColors } from '../utils/colors';
import { PRIORITY_LABELS } from '../utils/dateUtils';

export default function TaskItem({ task, onToggle, onPress }) {
  const priorityStyle = PriorityColors[task.priority] || PriorityColors.medium;

  return (
    <TouchableOpacity
      style={[styles.container, task.completed && styles.completed]}
      onPress={() => onPress && onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity style={styles.checkbox} onPress={() => onToggle && onToggle(task.id)}>
        <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.titleCompleted]} numberOfLines={1}>
          {task.title}
        </Text>
        {task.date && (
          <Text style={styles.date}>{task.date}</Text>
        )}
      </View>
      <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
        <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
          {priorityStyle.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginVertical: 3,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  completed: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
