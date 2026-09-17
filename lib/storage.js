import { seedTasks } from './seed.js'

// Bump this key if the data shape ever changes in a breaking way.
const STORAGE_KEY = 'taskflow.tasks.v1'

// The data structure here mirrors what a Supabase schema would look like
// (tasks table + todo_items table with a task_id foreign key), so this can be
// migrated to Supabase later without reshaping the data.

export function loadTasks() {
  if (typeof window === 'undefined') return seedTasks
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // First run on this device: seed once and persist.
      saveTasks(seedTasks)
      return seedTasks
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedTasks
    return parsed
  } catch {
    return seedTasks
  }
}

export function saveTasks(tasks) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Ignore quota / privacy-mode errors; app still works in-memory.
  }
}

export function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2)
}

export function nowIso() {
  return new Date().toISOString()
}
