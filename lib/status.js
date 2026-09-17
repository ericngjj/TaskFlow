// Central place for status / progress / overdue rules so the UI stays consistent.

export const STATUSES = ['Not Started', 'In Progress', 'Completed', 'On Hold']
export const PRIORITIES = ['Low', 'Medium', 'High']

// The effective status shown everywhere.
// - "On Hold" is a manual override and always wins.
// - Tasks WITH to-do items derive their status from progress
//   (all done => Completed, some done => In Progress, none => Not Started).
// - Tasks WITHOUT to-do items use the manual status the user picked.
export function computeStatus(task) {
  if (task.manualStatus === 'On Hold') return 'On Hold'

  if (task.items.length > 0) {
    const done = task.items.filter((i) => i.done).length
    if (done === task.items.length) return 'Completed'
    if (done > 0) return 'In Progress'
    return 'Not Started'
  }

  return task.manualStatus || 'Not Started'
}

export function progress(task) {
  const total = task.items.length
  const done = task.items.filter((i) => i.done).length
  const percent = total ? Math.round((done / total) * 100) : computeStatus(task) === 'Completed' ? 100 : 0
  return { done, total, percent }
}

// Compare a YYYY-MM-DD date string against today (local time).
function isPast(dateStr) {
  if (!dateStr) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(dateStr + 'T00:00:00')
  return d < today
}

export function isTaskOverdue(task) {
  return computeStatus(task) !== 'Completed' && isPast(task.due)
}

export function isTodoOverdue(item) {
  return !item.done && isPast(item.due)
}

// "Overdue Items" summary = overdue main tasks + overdue to-do items.
export function countOverdue(tasks) {
  let count = 0
  for (const t of tasks) {
    if (isTaskOverdue(t)) count++
    for (const i of t.items) if (isTodoOverdue(i)) count++
  }
  return count
}
