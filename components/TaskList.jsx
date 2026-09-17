import React from 'react'
import { computeStatus, progress, isTaskOverdue, PRIORITIES } from '../lib/status.js'

function statusClass(status) {
  return 'pill ' + status.toLowerCase().replace(/\s+/g, '-')
}

export default function TaskList({ tasks, selectedId, onSelect }) {
  if (tasks.length === 0) {
    return <div className="empty">No tasks match your filters.</div>
  }

  return (
    <div className="tasklist" role="list">
      {tasks.map((t) => {
        const status = computeStatus(t)
        const { done, total } = progress(t)
        const overdue = isTaskOverdue(t)
        return (
          <button
            type="button"
            role="listitem"
            className={'taskrow' + (t.id === selectedId ? ' chosen' : '') + (overdue ? ' overdue' : '')}
            onClick={() => onSelect(t.id)}
            key={t.id}
          >
            <div className="taskrow-main">
              <strong>{t.name}</strong>
              <small>
                {(t.vendor || 'Internal') + ' \u00b7 ' + t.category}
                {t.priority ? ' \u00b7 ' + t.priority + ' priority' : ''}
              </small>
            </div>
            <div className="rowright">
              <span className={statusClass(status)}>{status}</span>
              <small>
                {done}/{total} done
              </small>
              {overdue && <small className="overdue-tag">Overdue</small>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// Shared sort + filter used by the app to build the visible list.
export function filterAndSort(tasks, controls) {
  const q = controls.q.trim().toLowerCase()

  let list = tasks.filter((t) => {
    const status = computeStatus(t)
    if (controls.status !== 'All' && status !== controls.status) return false
    if (controls.vendor !== 'All' && (t.vendor || 'Internal') !== controls.vendor) return false
    if (controls.priority !== 'All' && t.priority !== controls.priority) return false
    if (q) {
      const hay = (t.name + ' ' + (t.vendor || '') + ' ' + t.category).toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  list = [...list].sort((a, b) => {
    if (controls.sort === 'updated') {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    }
    // Due date: tasks without a due date sink to the bottom.
    if (!a.due && !b.due) return 0
    if (!a.due) return 1
    if (!b.due) return -1
    return new Date(a.due) - new Date(b.due)
  })

  return list
}

export { PRIORITIES }
