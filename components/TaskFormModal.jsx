import React, { useEffect, useState } from 'react'
import { STATUS_LIST, PRIORITIES } from '../data.js'

const empty = {
  name: '',
  vendor: '',
  category: '',
  description: '',
  due: '',
  priority: 'Medium',
  status: 'Not Started',
  notes: '',
}

// Used for both creating a new main task and editing an existing one.
export default function TaskFormModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm({ ...empty, ...(initial || {}) })
  }, [initial])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      name: form.name.trim(),
      vendor: form.vendor.trim(),
      category: form.category.trim() || 'General',
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h2>{mode === 'edit' ? 'Edit Task' : 'Add Task'}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={submit}>
          <label className="field">
            <span>Task name *</span>
            <input value={form.name} onChange={set('name')} placeholder="e.g. New vendor SOW" autoFocus />
          </label>

          <div className="form-grid">
            <label className="field">
              <span>Vendor</span>
              <input value={form.vendor} onChange={set('vendor')} placeholder="e.g. Synechron" />
            </label>
            <label className="field">
              <span>Category</span>
              <input value={form.category} onChange={set('category')} placeholder="e.g. SOW, Addendum" />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Due date</span>
              <input type="date" value={form.due} onChange={set('due')} />
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Initial status</span>
            <select value={form.status} onChange={set('status')}>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Description</span>
            <textarea value={form.description} onChange={set('description')} rows={2} placeholder="What is this task about?" />
          </label>

          <label className="field">
            <span>Notes</span>
            <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="Any extra notes" />
          </label>

          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">{mode === 'edit' ? 'Save changes' : 'Add task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
