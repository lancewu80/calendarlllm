import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadEvents, saveEvents, loadTasks, saveTasks } from '../utils/storage';
// Simple unique ID generator (avoids uuid ESM issues in Expo)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const CalendarContext = createContext();

export function CalendarProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  useEffect(() => {
    (async () => {
      const storedEvents = await loadEvents();
      const storedTasks = await loadTasks();
      setEvents(storedEvents);
      setTasks(storedTasks);
      setLoaded(true);
    })();
  }, []);

  const persistEvents = useCallback(async (newEvents) => {
    setEvents(newEvents);
    await saveEvents(newEvents);
  }, []);

  const persistTasks = useCallback(async (newTasks) => {
    setTasks(newTasks);
    await saveTasks(newTasks);
  }, []);

  const addEvent = useCallback(async (eventData) => {
    const newEvent = {
      id: generateId(),
      title: eventData.title || '',
      content: eventData.content || '',
      date: eventData.date || '',
      startTime: eventData.startTime || '',
      endTime: eventData.endTime || '',
      location: eventData.location || '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...events, newEvent];
    await persistEvents(updated);
    return newEvent;
  }, [events, persistEvents]);

  const updateEvent = useCallback(async (id, updates) => {
    const updated = events.map((e) => (e.id === id ? { ...e, ...updates } : e));
    await persistEvents(updated);
  }, [events, persistEvents]);

  const deleteEvent = useCallback(async (id) => {
    const updated = events.filter((e) => e.id !== id);
    await persistEvents(updated);
  }, [events, persistEvents]);

  const addTask = useCallback(async (taskData) => {
    const newTask = {
      id: generateId(),
      title: taskData.title || '',
      date: taskData.date || '',
      priority: taskData.priority || 'medium',
      completed: false,
      notes: taskData.notes || '',
      createdAt: new Date().toISOString(),
    };
    const updated = [...tasks, newTask];
    await persistTasks(updated);
    return newTask;
  }, [tasks, persistTasks]);

  const updateTask = useCallback(async (id, updates) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    await persistTasks(updated);
  }, [tasks, persistTasks]);

  const deleteTask = useCallback(async (id) => {
    const updated = tasks.filter((t) => t.id !== id);
    await persistTasks(updated);
  }, [tasks, persistTasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    await persistTasks(updated);
  }, [tasks, persistTasks]);

  return (
    <CalendarContext.Provider
      value={{
        events,
        tasks,
        loaded,
        currentDate,
        setCurrentDate,
        currentView,
        setCurrentView,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
}
