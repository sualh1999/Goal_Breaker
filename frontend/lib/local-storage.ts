// frontend/lib/local-storage.ts

export interface StoredGoal {
  id: string;
  title: string;
}

const LOCAL_STORAGE_KEY = 'smartGoals';

export function getStoredGoals(): StoredGoal[] {
  if (typeof window === 'undefined') {
    return []; // Return empty array if not in browser environment
  }
  try {
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
}

export function addStoredGoal(goal: StoredGoal): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const goals = getStoredGoals();
    // Check if goal already exists to prevent duplicates based on ID
    if (!goals.some(g => g.id === goal.id)) {
      goals.unshift(goal); // Add new goal to the beginning
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
    }
  } catch (error) {
    console.error("Error writing to local storage", error);
  }
}

export function clearStoredGoals(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing local storage", error);
  }
}
