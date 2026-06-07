import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../utils/colors';

export default function EventForm({ visible, onClose, onSubmit, event, date }) {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [startHour, setStartHour] = React.useState('09');
  const [startMin, setStartMin] = React.useState('00');
  const [endHour, setEndHour] = React.useState('10');
  const [endMin, setEndMin] = React.useState('00');
  const [allDay, setAllDay] = React.useState(false);

  React.useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setContent(event.content || '');
      setLocation(event.location || '');
      if (event.startTime) {
        const s = new Date(event.startTime);
        setStartHour(String(s.getHours()).padStart(2, '0'));
        setStartMin(String(s.getMinutes()).padStart(2, '0'));
      }
      if (event.endTime) {
        const e = new Date(event.endTime);
        setEndHour(String(e.getHours()).padStart(2, '0'));
        setEndMin(String(e.getMinutes()).padStart(2, '0'));
      }
      setAllDay(!event.startTime);
    } else {
      setTitle('');
      setContent('');
      setLocation('');
      setStartHour('09');
      setStartMin('00');
      setEndHour('10');
      setEndMin('00');
      setAllDay(false);
    }
  }, [event, visible]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    let startTime = '';
    let endTime = '';
    if (!allDay) {
      startTime = `${date}T${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}:00`;
      endTime = `${date}T${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}:00`;
    }
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      location: location.trim(),
      date,
      startTime,
      endTime,
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
            <Text style={styles.headerTitle}>{event ? '編輯事件' : '新增事件'}</Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={[styles.saveBtn, !title.trim() && styles.saveBtnDisabled]}>
                {event ? '儲存' : '新增'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.dateLabel}>{date}</Text>

            <TextInput
              style={styles.input}
              placeholder="標題 *"
              placeholderTextColor={Colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="地點"
              placeholderTextColor={Colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="內容"
              placeholderTextColor={Colors.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.allDayRow} onPress={() => setAllDay(!allDay)}>
              <View style={[styles.checkbox, allDay && styles.checkboxOn]}>
                {allDay && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.allDayLabel}>全天事件</Text>
            </TouchableOpacity>

            {!allDay && (
              <View style={styles.timeRow}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>開始</Text>
                  <View style={styles.timeInputRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={startHour}
                      onChangeText={setStartHour}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeColon}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={startMin}
                      onChangeText={setStartMin}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>結束</Text>
                  <View style={styles.timeInputRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={endHour}
                      onChangeText={setEndHour}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.timeColon}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={endMin}
                      onChangeText={setEndMin}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>
            )}
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
    maxHeight: '85%',
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
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  allDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  allDayLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeBlock: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    width: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeColon: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 4,
    color: Colors.text,
  },
});
