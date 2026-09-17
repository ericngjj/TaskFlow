// Data model, seed data, storage, and status/progress helpers for TaskFlow.
// The shape here is intentionally flat and serializable so it can later be
// migrated to Supabase tables (tasks + todo_items) with minimal changes.

export const STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
}

export const STATUS_LIST = [
  STATUS.NOT_STARTED,
  STATUS.IN_PROGRESS,
  STATUS.COMPLETED,
  STATUS.ON_HOLD,
]

export const PRIORITIES = ['Low', 'Medium', 'High']

const STORAGE_KEY = 'taskflow.tracker.v1'

const now = () => new Date().toISOString()

// Build the initial Mizuho PMO tasks. Timestamps are generated once and then
// persisted, so seed data does not "reset" on every load.
function buildSeed() {
  const stamp = now()
  const task = (id, name, vendor, category, extra, items) => ({
    id,
    name,
    vendor,
    category,
    description: extra.description || '',
    notes: extra.notes || '',
    priority: extra.priority || 'Medium',
    due: extra.due || '',
    status: STATUS.NOT_STARTED,
    manualCompleted: false,
    createdAt: stamp,
    updatedAt: stamp,
    items: items.map((text, i) => ({
      id: id * 100 + i + 1,
      text,
      done: false,
      notes: '',
      due: '',
      completedAt: null,
    })),
  })

  return [
    task(1, 'PIR', 'Internal', 'Review', { priority: 'High', due: '2026-10-01' }, [
      'Check across all contracts for PIR due this year',
      'Check if renewal or existing',
    ]),
    task(2, 'Synechron Data Entry Staff Aug SOW', 'Synechron', 'SOW', { priority: 'Medium' }, [
      'Pending SOC/OSPAR from Synechron',
      'Pending AML PEGA approval',
      'Yet to start on AFA',
    ]),
    task(3, 'Synechron VBA Expert Staff Aug SOW', 'Synechron', 'SOW', { priority: 'Medium' }, [
      'Pending SOC/OSPAR from Synechron',
      'Pending AML PEGA approval',
      'Yet to start on AFA',
    ]),
    task(4, 'Microsoft HO Form 3.1', 'Microsoft', 'HO Form', { priority: 'Medium' }, [
      'Yet to start',
    ]),
    task(5, 'TCS MIBO BAU IT OPS Addendum 3 - Tenable & PowerBI', 'TCS', 'Addendum', { priority: 'High' }, [
      'Addendum 3 pending AFA for contract',
      'AFA for investment PEGA approval',
    ]),
    task(6, 'TCS MIBO BAU IT OPS Addendum 4 - Mail migration', 'TCS', 'Addendum', { priority: 'High' }, [
      'TPRM review',
      'HOIT Review',
      'Legal Review',
      'Make Pega',
    ]),
    task(7, 'NEC pilot 3 Yr TPA/REDD', 'NEC', 'Contract', { priority: 'Medium' }, [
      'Pending TPA amendment',
    ]),
    task(8, 'MGS LAPTOP MAKE CONTRACT', 'MGS', 'Contract', { priority: 'Low' }, []),
  ]
}

// Fill in any fields missing from older stored data so upgrades stay safe.
function normalizeTask(t) {
  return {
    id: t.id,
    name: t.name || '',
    vendor: t.vendor || '',
    category: t.category || 'General',
    description: t.description || '',
    notes: t.notes || '',
    priority: PRIORITIES.includes(t.priority) ? t.priority : 'Medium',
    due: t.due || '',
    status: STATUS_LIST.includes(t.status) ? t.status : STATUS.NOT_STARTED,
    manualCompleted: !!t.manualCompleted,
    createdAt: t.createdAt || now(),
    updatedAt: t.updatedAt || now(),
    items: (t.items || []).map((i) => ({
      id: i.id,
      text: i.text || '',
      done: !!i.done,
      notes: i.notes || '',
      due: i.due || '',
      completedAt: i.completedAt || null,
    })),
  }
}

export function loadTasks() {
  if (typeof window === 'undefined') return buildSeed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seed = buildSeed()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return buildSeed()
    return parsed.map(normalizeTask)
  } catch (e) {
    console.log('[v0] Failed to load tasks, seeding fresh:', e.message)
    return buildSeed()
  }
}

export function saveTasks(tasks) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.log('[v0] Failed to save tasks:', e.message)
  }
}

// Derived status: to-do items drive the status automatically. "On Hold" is an
// explicit manual override, and manual completion applies to item-less tasks.
export function statusOf(task) {
  if (task.status === STATUS.ON_HOLD) return STATUS.ON_HOLD
  if (task.items.length) {
    if (task.items.every((i) => i.done)) return STATUS.COMPLETED
    if (task.items.some((i) => i.done)) return STATUS.IN_PROGRESS
    return STATUS.NOT_STARTED
  }
  if (task.manualCompleted) return STATUS.COMPLETED
  return task.status || STATUS.NOT_STARTED
}

export function isCompleted(task) {
  return statusOf(task) === STATUS.COMPLETED
}

export function progressOf(task) {
  const total = task.items.length
  if (!total) {
    const done = task.manualCompleted ? 1 : 0
    return { done, total: task.manualCompleted ? 1 : 0, pct: task.manualCompleted ? 100 : 0 }
  }
  const done = task.items.filter((i) => i.done).length
  return { done, total, pct: Math.round((done / total) * 100) }
}

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isPastDue(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  return d < startOfToday()
}

// A to-do item is overdue when it has a past due date and is not yet ended.
export function isItemOverdue(item) {
  return !item.done && isPastDue(item.due)
}

// A main task is overdue when it has a past due date and is not completed.
export function isTaskOverdue(task) {
  return !isCompleted(task) && isPastDue(task.due)
}

export function overdueCount(tasks) {
  let n = 0
  for (const t of tasks) {
    if (isTaskOverdue(t)) n++
    for (const i of t.items) if (isItemOverdue(i)) n++
  }
  return n
}

export function newId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}
