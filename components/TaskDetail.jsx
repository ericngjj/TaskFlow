import React, { useState } from 'react'
import TodoItem from './TodoItem.jsx'
import { computeStatus, progress, isTaskOverdue } from '../lib/status.js'

function formatDate(iso, dateOnly) {
  if (!iso) return '\u2014'
  const value = dateOnly ? iso + 'T00:00:00' : iso
  const d = new Date(value)
  if (isNaN(d)) return '\u2014'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusClass(status) {
  return 'pill ' + status.toLowerCase().replace(/\s+/g, '-')
}

export default function TaskDetail({ task, actions, onEditTask }) {
  const [newTodo, setNewTodo] = useState('')

  if (!task) {
    return (
      <div className="panel detail">
        <div className="empty">Select a task to see its details.</div>
      </div>
    )
  }

  const status = computeStatus(task)
  const { done, total, percent } = progress(task)
  const overdue = isTaskOverdue(task)
  const canManualComplete = total === 0

  const addTodo = () => {
    if (!newTodo.trim()) return
    actions.addTodo(task.id, newTodo.trim())
    setNewTodo('')
  }

  return (
    <div className="panel detail">
      <div className="detailhead">
        <div>
          <span className="eyebrow">MAIN TASK</span>
          <h2>{task.name}</h2>
          <p>
            {(task.vendor || 'Internal') + ' \u00b7 ' + task.category + ' \u00b7 ' + task.priority + ' priority'}
          </p>
        </div>
        <div className="detailhead-right">
          <span className={statusClass(status)}>{status}</span>
          {overdue && <span className="pill overdue-pill">Overdue</span>}
        </div>
      </div>

      <div className="detail-actions">
        <button className="btn-ghost" onClick={() => onEditTask(task)}>
          Edit task
        </button>
        <select
          className="hold-select"
          value={task.manualStatus}
          onChange={(e) => actions.setManualStatus(task.id, e.target.value)}
          aria-label="Set manual status"
          title="On Hold overrides progress. For tasks with no to-dos, this sets the status directly."
        >
          <option value="Not Started">Manual: Not Started</option>
          <option value="In Progress">Manual: In Progress</option>
          <option value="On Hold">Manual: On Hold</option>
          <option value="Completed">Manual: Completed</option>
        </select>
        <button className="btn-danger" onClick={() => actions.deleteTask(task.id)}>
          Delete task
        </button>
      </div>

      {canManualComplete && (
        <p className="hint">This task has no to-do items. Use the manual status above to mark it Completed.</p>
      )}

      {task.description && <p className="detail-description">{task.description}</p>}

      <div className="meta-grid">
        <div>
          <span>Due date</span>
          <strong className={overdue ? 'overdue-text' : ''}>{formatDate(task.due, true)}</strong>
        </div>
        <div>
          <span>Created</span>
          <strong>{formatDate(task.createdAt)}</strong>
        </div>
        <div>
          <span>Last updated</span>
          <strong>{formatDate(task.updatedAt)}</strong>
        </div>
      </div>

      {task.notes && (
        <div className="task-notes">
          <span className="eyebrow">NOTES</span>
          <p>{task.notes}</p>
        </div>
      )}

      <div className="progress">
        <div>
          <span>Progress</span>
          <b>
            {done} / {total} {total ? 'to-do items' : '(no to-do items)'}
          </b>
        </div>
        <div className="bar">
          <i style={{ width: percent + '%' }} />
        </div>
      </div>

      <div className="todohead">
        <h3>To-Do List</h3>
      </div>

      <div className="addrow">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addTodo()
          }}
          placeholder="Add a new to-do item"
          aria-label="New to-do item"
        />
        <button className="btn-primary" onClick={addTodo}>
          Add
        </button>
      </div>

      {task.items.length ? (
        <div className="todos">
          {task.items.map((item) => (
            <TodoItem
              key={item.id}
              item={item}
              onToggle={(id) => actions.toggleTodo(task.id, id)}
              onDelete={(id) => actions.deleteTodo(task.id, id)}
              onEdit={(id, patch) => actions.editTodo(task.id, id, patch)}
            />
          ))}
        </div>
      ) : (
        <div className="empty">No to-do items yet. Add the first action for this task.</div>
      )}
    </div>
  )
}
