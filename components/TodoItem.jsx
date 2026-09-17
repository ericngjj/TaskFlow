import React, { useState } from 'react'
import { isItemOverdue } from '../data.js'

function fmt(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TodoItem({ item, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.text)
  const [due, setDue] = useState(item.due || '')
  const [notes, setNotes] = useState(item.notes || '')
  const [showNotes, setShowNotes] = useState(false)

  const overdue = isItemOverdue(item)

  const save = () => {
    if (!text.trim()) return
    onEdit({ text: text.trim(), due, notes })
    setEditing(false)
  }

  const cancel = () => {
    setText(item.text)
    setDue(item.due || '')
    setNotes(item.notes || '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="todo editing">
        <div className="todo-edit">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="To-do item" aria-label="To-do text" />
          <div className="todo-edit-row">
            <label className="field">
              <span>Due date</span>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes for this item" />
          </label>
          <div className="todo-actions">
            <button onClick={save}>Save</button>
            <button className="ghost" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`todo ${item.done ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>
      <button
        className="check"
        onClick={onToggle}
        aria-label={item.done ? 'Reopen item' : 'Mark item as ended'}
        title={item.done ? 'Reopen item' : 'Mark item as ended'}
      >
        {item.done ? '✓' : ''}
      </button>
      <div className="todo-body">
        <span>{item.text}</span>
        <div className="todo-meta">
          {item.due && <em className={overdue ? 'overdue-text' : ''}>Due {fmt(item.due)}</em>}
          {item.done && item.completedAt && <em>Ended {new Date(item.completedAt).toLocaleDateString()}</em>}
          {item.notes && (
            <button className="linkbtn" onClick={() => setShowNotes((s) => !s)}>
              {showNotes ? 'Hide notes' : 'Notes'}
            </button>
          )}
        </div>
        {showNotes && item.notes && <p className="todo-notes">{item.notes}</p>}
      </div>
      <div className="todo-controls">
        <button className="end" onClick={onToggle}>
          {item.done ? 'Reopen' : 'End'}
        </button>
        <button className="iconbtn" onClick={() => setEditing(true)} aria-label="Edit item" title="Edit">
          ✎
        </button>
        <button className="iconbtn danger" onClick={onDelete} aria-label="Delete item" title="Delete">
          ✕
        </button>
      </div>
    </div>
  )
}
