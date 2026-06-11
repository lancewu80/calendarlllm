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
import { Calendar } from 'react-native-calendars';
import { Colors, PriorityColors } from '../utils/colors';
import { getLunarFullStr } from '../utils/lunarUtils';

const PRIORITIES = ['high', 'medium', 'low'];

function todayStr() {
  const d = new Date();
  const m   = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function TaskForm({ visible, onClose, onSubmit, task, date }) {
  const [selectedDate,   setSelectedDate]   = React.useState(date || todayStr());
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const [title,    setTitle]    = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [notes,    setNotes]    = React.useState('');

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setPriority(task.priority || 'medium');
      setNotes(task.notes || '');
      setSelectedDate(task.date || date || todayStr());
    } else {
      setTitle('');
      setPriority('medium');
      setNotes('');
      setSelectedDate(date || todayStr());
    }
    setShowDatePicker(false);
  }, [task, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title   : title.trim(),
      date    : selectedDate,
      priority,
      notes   : notes.trim(),
    });
    onClose();
  };

  const lunarLabel = (() => {
    try {
      const [y, m, d] = selectedDate.split('-').map(Number);
      return getLunarFullStr(y, m, d);
    } catch { return ''; }
  })();

  return (
    <>
      {/* ── 主表單 ──────────────────────────────────────────── */}
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
              {/* 日期選擇列 */}
              <TouchableOpacity
                style={styles.datePicker}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.dateMain}>{selectedDate}</Text>
                  {lunarLabel ? <Text style={styles.dateLunar}>{lunarLabel}</Text> : null}
                </View>
                <Text style={styles.dateEditHint}>修改日期 ›</Text>
              </TouchableOpacity>

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
                  const pc       = PriorityColors[p];
                  const selected = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityBtn,
                        { backgroundColor: pc.bg },
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

      {/* ── 日期選擇器 ──────────────────────────────────────── */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerCancel}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>選擇日期</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.pickerDone}>完成</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerSelectedRow}>
              <Text style={styles.pickerSelectedDate}>{selectedDate}</Text>
              {lunarLabel ? <Text style={styles.pickerSelectedLunar}>{lunarLabel}</Text> : null}
            </View>

            <Calendar
              current={selectedDate}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowDatePicker(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected         : true,
                  selectedColor    : Colors.warning,
                  selectedTextColor: '#FFF',
                },
              }}
              theme={{
                backgroundColor          : Colors.card,
                calendarBackground       : Colors.card,
                todayTextColor           : Colors.warning,
                arrowColor               : Colors.warning,
                monthTextColor           : Colors.text,
                textMonthFontWeight      : '700',
                dayTextColor             : Colors.text,
                textDisabledColor        : Colors.border,
                selectedDayBackgroundColor: Colors.warning,
                selectedDayTextColor     : '#FFF',
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ── 主表單 ───────────────────────────────────────────────────
  overlay: {
    flex           : 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent : 'flex-end',
  },
  container: {
    backgroundColor     : Colors.card,
    borderTopLeftRadius : 20,
    borderTopRightRadius: 20,
    maxHeight           : '82%',
  },
  header: {
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    alignItems       : 'center',
    padding          : 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize  : 17,
    fontWeight: '600',
    color     : Colors.text,
  },
  cancelBtn: {
    fontSize: 16,
    color   : Colors.textSecondary,
  },
  saveBtn: {
    fontSize  : 16,
    color     : Colors.primary,
    fontWeight: '600',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  form: {
    padding: 16,
  },

  // ── 日期選擇列 ───────────────────────────────────────────────
  datePicker: {
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    alignItems       : 'center',
    backgroundColor  : '#FFF3E0',
    borderRadius     : 12,
    paddingHorizontal: 14,
    paddingVertical  : 10,
    marginBottom     : 12,
    borderWidth      : 1,
    borderColor      : Colors.warning + '60',
  },
  dateMain: {
    fontSize  : 15,
    fontWeight: '700',
    color     : Colors.warning,
  },
  dateLunar: {
    fontSize : 11,
    color    : Colors.warning,
    marginTop: 2,
    opacity  : 0.85,
  },
  dateEditHint: {
    fontSize  : 13,
    color     : Colors.warning,
    fontWeight: '500',
  },

  // ── 表單欄位 ─────────────────────────────────────────────────
  input: {
    backgroundColor : Colors.background,
    borderRadius    : 10,
    padding         : 14,
    fontSize        : 15,
    color           : Colors.text,
    marginBottom    : 12,
    borderWidth     : 1,
    borderColor     : Colors.border,
  },
  textArea: {
    height           : 80,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize  : 14,
    fontWeight: '600',
    color     : Colors.text,
    marginBottom: 8,
    marginTop   : 4,
  },
  priorityRow: {
    flexDirection: 'row',
    marginBottom : 12,
  },
  priorityBtn: {
    flex          : 1,
    paddingVertical: 10,
    borderRadius  : 8,
    alignItems    : 'center',
    marginHorizontal: 4,
    borderWidth   : 2,
    borderColor   : 'transparent',
  },
  priorityText: {
    fontSize  : 15,
    fontWeight: '600',
  },

  // ── 日期選擇器 Modal ─────────────────────────────────────────
  pickerOverlay: {
    flex           : 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent : 'flex-end',
  },
  pickerContainer: {
    backgroundColor     : Colors.card,
    borderTopLeftRadius : 20,
    borderTopRightRadius: 20,
    paddingBottom       : 24,
  },
  pickerHeader: {
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    alignItems       : 'center',
    paddingHorizontal: 20,
    paddingVertical  : 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize  : 17,
    fontWeight: '600',
    color     : Colors.text,
  },
  pickerCancel: {
    fontSize: 16,
    color   : Colors.textSecondary,
  },
  pickerDone: {
    fontSize  : 16,
    color     : Colors.warning,
    fontWeight: '600',
  },
  pickerSelectedRow: {
    alignItems     : 'center',
    paddingVertical: 10,
    backgroundColor: '#FFF3E0',
  },
  pickerSelectedDate: {
    fontSize  : 16,
    fontWeight: '700',
    color     : Colors.warning,
  },
  pickerSelectedLunar: {
    fontSize : 12,
    color    : Colors.warning,
    marginTop: 2,
    opacity  : 0.85,
  },
});
