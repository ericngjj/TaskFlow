import React, { useState } from 'react'
import { STATUS, statusOf, progressOf, isTaskOverdue } from '../data.js'
import TodoItem from './TodoItem.jsx'

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtDate(dateStr) {
  if (!dateStr) return 'No due date'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function TaskDetail({
  task,
  onEditTask,
  onDeleteTask,
  onAddItem,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onToggleManualComplete,
}) {
  const [newItem, setNewItem] = useState('')

  if (!task) {
    return (
      <div className="panel detail">
        <div className="empty">Select a task to see its details.</div>
      </div>
    )
  }

  const st = statusOf(task)
  const prog = progressOf(task)
  const overdue = isTaskOverdue(task)
  const hasItems = task.items.length > 0

  const addItem = () => {
    if (!newItem.trim()) return
    onAddItem(newItem.trim())
    setNewItem('')
  }

  return (
    <div className="panel detail">
      <div className="detailhead">
        <div>
          <div className="eyebrow">{task.category?.toUpperCase() || 'TASK'}</div>
          <h2>{task.name}</h2>
          <div className="detail-tags">
            <span
              className={`pill ${
                st === STATUS.COMPLETED
                  ? 'completed'
                  : st === STATUS.IN_PROGRESS
                    ? 'in-progress'
                    : st === STATUS.ON_HOLD
                      ? 'on-hold'
                      : 'not-started'
              }`}
            >
              {st}
            </span>
            <span className={`pill prio prio-${task.priority.toLowerCase()}`}>{task.priority} priority</span>
            {task.vendor && <span className="pill">{task.vendor}</span>}
            {overdue && <span className="pill overdue-pill">Overdue</span>}
          </div>
        </div>
        <div className="detail-actions">
          <button className="ghost" onClick={onEditTask}>
            Edit
          </button>
          <button className="ghost danger" onClick={onDeleteTask}>
            Delete
          </button>
        </div>
      </div>

      {task.description && <p className="detail-desc">{task.description}</p>}

      <div className="detail-grid">
        <div>
          <span className="k">Due date</span>
          <span className={`v ${overdue ? 'overdue-text' : ''}`}>{fmtDate(task.due)}</span>
        </div>
        <div>
          <span className="k">Created</span>
          <span className="v">{fmtDateTime(task.createdAt)}</span>
        </div>
        <div>
          <span className="k">Last updated</span>
          <span className="v">{fmtDateTime(task.updatedAt)}</span>
        </div>
      </div>

      {task.notes && (
        <div className="detail-notes">
          <span className="k">Notes</span>
          <p>{task.notes}</p>
        </div>
      )}

      <div className="progress">
        <div>
          <span>Progress</span>
          <span>
            {hasItems ? `${prog.done}/${prog.total} ended` : task.manualCompleted ? 'Completed' : 'Not completed'} ·{' '}
            {prog.pct}%
          </span>
        </div>
        <div className="bar">
          <i style={{ width: `${prog.pct}%` }} />
        </div>
      </div>

      <div className="todohead">
        <h3>To-Do List</h3>
        {!hasItems && (
          <button className={task.manualCompleted ? 'ghost' : ''} onClick={onToggleManualComplete}>
            {task.manualCompleted ? 'Mark as not completed' : 'Mark task complete'}
          </button>
        )}
      </div>

      <div className="addrow">
        <input
          placeholder="Add a to-do item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addItem()
          }}
          aria-label="New to-do item"
        />
        <button onClick={addItem}>Add</button>
      </div>

      <div className="todolist">
        {!hasItems && <div className="empty">No to-do items yet. Add one above, or mark the task complete.</div>}
        {task.items.map((item) => (
          <TodoItem
            key={item.id}
            item={item}
            onToggle={() => onToggleItem(item.id)}
            onEdit={(patch) => onEditItem(item.id, patch)}
            onDelete={() => onDeleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
