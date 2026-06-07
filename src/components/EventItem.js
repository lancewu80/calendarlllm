import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../utils/colors';

export default function EventItem({ event, onPress }) {
  const startDisplay = event.startTime
    ? new Date(event.startTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';
  const endDisplay = event.endTime
    ? new Date(event.endTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress(event)}
      activeOpacity={0.7}
    >
      <View style={styles.timeColumn}>
        {startDisplay ? (
          <>
            <Text style={styles.timeText}>{startDisplay}</Text>
            {endDisplay && <Text style={styles.timeSeparator}>─</Text>}
            {endDisplay && <Text style={styles.timeText}>{endDisplay}</Text>}
          </>
        ) : (
          <Text style={styles.timeText}>全天</Text>
        )}
      </View>
      <View style={styles.line} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
        {event.location ? (
          <Text style={styles.location}>📍 {event.location}</Text>
        ) : null}
        {event.content ? (
          <Text style={styles.desc} numberOfLines={1}>{event.content}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  timeColumn: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 10,
    color: Colors.border,
    marginVertical: 1,
  },
  line: {
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginHorizontal: 10,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
