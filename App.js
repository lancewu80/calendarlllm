import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarProvider, useCalendar } from './src/context/CalendarContext';
import { Colors } from './src/utils/colors';
import { navigateDate } from './src/utils/dateUtils';

import MonthView from './src/screens/MonthView';
import WeekView from './src/screens/WeekView';
import DayView from './src/screens/DayView';
import YearView from './src/screens/YearView';
import TodoScreen from './src/screens/TodoScreen';

const Tab = createBottomTabNavigator();

const VIEW_OPTIONS = [
  { key: 'day', label: '日' },
  { key: 'week', label: '週' },
  { key: 'month', label: '月' },
  { key: 'year', label: '年' },
];

function CalendarTabs() {
  const { currentDate, setCurrentDate, currentView, setCurrentView } = useCalendar();

  const goPrev = () => {
    setCurrentDate(navigateDate(currentDate, currentView, -1));
  };

  const goNext = () => {
    setCurrentDate(navigateDate(currentDate, currentView, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const viewLabels = {
    day: currentDate.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
    week: '本週',
    month: currentDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
    year: currentDate.getFullYear().toString(),
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={styles.viewSwitcher}>
          {VIEW_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.viewBtn, currentView === opt.key && styles.viewBtnActive]}
              onPress={() => setCurrentView(opt.key)}
            >
              <Text
                style={[styles.viewBtnText, currentView === opt.key && styles.viewBtnTextActive]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToday} style={styles.todayBtn}>
          <Text style={styles.todayBtnText}>{viewLabels[currentView]}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNext} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {currentView === 'day' && <DayView />}
      {currentView === 'week' && <WeekView />}
      {currentView === 'month' && <MonthView />}
      {currentView === 'year' && <YearView />}
    </SafeAreaView>
  );
}

function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {label === '行事曆' ? '📅' : '✅'}
    </Text>
  );
}

export default function App() {
  return (
    <CalendarProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon label={route.name} focused={focused} />
            ),
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.textSecondary,
            tabBarStyle: {
              backgroundColor: Colors.card,
              borderTopColor: Colors.border,
              height: Platform.OS === 'ios' ? 85 : 60,
              paddingBottom: Platform.OS === 'ios' ? 20 : 8,
              paddingTop: 6,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
          })}
        >
          <Tab.Screen name="行事曆" component={CalendarTabs} />
          <Tab.Screen name="待辦" component={TodoScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  topBar: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 3,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 17,
    alignItems: 'center',
  },
  viewBtnActive: {
    backgroundColor: '#FFF',
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  viewBtnTextActive: {
    color: Colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  navBtnText: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '300',
  },
  todayBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  todayBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
