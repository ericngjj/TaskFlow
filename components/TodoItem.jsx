import React, { useState } from 'react'
import { isTodoOverdue } from '../lib/status.js'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TodoItem({ item, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ text: item.text, due: item.due, notes: item.notes })
  const overdue = isTodoOverdue(item)

  const startEdit = () => {
    setDraft({ text: item.text, due: item.due, notes: item.notes })
    setEditing(true)
  }

  const save = () => {
    if (!draft.text.trim()) return
    onEdit(item.id, { text: draft.text.trim(), due: draft.due, notes: draft.notes })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="todo editing">
        <input
          className="todo-edit-text"
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          placeholder="To-do item"
          aria-label="To-do text"
        />
        <div className="todo-edit-row">
          <label className="field">
            <span>Due date</span>
            <input
              type="date"
              value={draft.due || ''}
              onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))}
            />
          </label>
        </div>
        <textarea
          className="todo-edit-notes"
          value={draft.notes || ''}
          onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
          placeholder="Notes for this to-do"
          rows={2}
          aria-label="To-do notes"
        />
        <div className="todo-edit-actions">
          <button className="btn-primary" onClick={save}>
            Save
          </button>
          <button className="btn-ghost" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={'todo' + (item.done ? ' done' : '') + (overdue ? ' overdue' : '')}>
      <button
        className="check"
        onClick={() => onToggle(item.id)}
        aria-label={item.done ? 'Reopen to-do' : 'Mark to-do as ended'}
        title={item.done ? 'Reopen' : 'End'}
      >
        {item.done ? '\u2713' : ''}
      </button>

      <div className="todo-body">
        <span className="todo-text">{item.text}</span>
        <div className="todo-meta">
          {item.done && item.completedAt && (
            <span className="meta-chip completed-chip">Completed {formatDate(item.completedAt)}</span>
          )}
          {item.due && (
            <span className={'meta-chip' + (overdue ? ' overdue-chip' : '')}>Due {formatDate(item.due + 'T00:00:00')}</span>
          )}
        </div>
        {item.notes && <p className="todo-notes">{item.notes}</p>}
      </div>

      <div className="todo-actions">
        <button className="btn-ghost sm" onClick={startEdit}>
          Edit
        </button>
        <button className="btn-ghost sm" onClick={() => onToggle(item.id)}>
          {item.done ? 'Reopen' : 'End'}
        </button>
        <button className="btn-danger sm" onClick={() => onDelete(item.id)} aria-label="Delete to-do">
          Delete
        </button>
      </div>
    </div>
  )
}
