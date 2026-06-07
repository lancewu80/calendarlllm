import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, PriorityColors } from '../utils/colors';

const PRIORITIES = ['high', 'medium', 'low'];

export default function TaskForm({ visible, onClose, onSubmit, task, date }) {
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [notes, setNotes] = React.useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || 'medium');
      setNotes(task.notes || '');
    } else {
      setTitle('');
      setPriority('medium');
      setNotes('');
    }
  }, [task, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      date: task?.date || date || '',
      priority,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelBtn}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{task ? '編輯任務' : '新增任務'}</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}>
                {task ? '儲存' : '新增'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.dateLabel}>{task?.date || date}</Text>

            <TextInput
              style={styles.input}
              placeholder="任務標題 *"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.sectionLabel}>優先等級</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const pc = PriorityColors[p];
                const selected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      { backgroundColor: pc.bg },
                      selected && styles.prioritySelected,
                      selected && { borderColor: pc.text },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, { color: pc.text }]}>
                      {pc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>備註</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="備註..."
              placeholderTextColor={Colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelBtn: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveBtn: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  form: {
    padding: 16,
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  prioritySelected: {
    borderWidth: 2,
  },
  priorityText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
