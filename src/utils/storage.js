import AsyncStorage from '@react-native-async-storage/async-storage';

const EVENTS_KEY = '@calendarlllm_events';
const TASKS_KEY = '@calendarlllm_tasks';

export const saveEvents = async (events) => {
  try {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Error saving events:', e);
  }
};

export const loadEvents = async () => {
  try {
    const json = await AsyncStorage.getItem(EVENTS_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error loading events:', e);
    return [];
  }
};

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

export const loadTasks = async () => {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Error loading tasks:', e);
    return [];
  }
};
