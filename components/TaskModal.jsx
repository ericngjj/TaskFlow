import React, { useEffect, useState } from 'react'
import { STATUSES, PRIORITIES } from '../lib/status.js'

const empty = {
  name: '',
  vendor: '',
  category: '',
  description: '',
  due: '',
  priority: 'Medium',
  manualStatus: 'Not Started',
  notes: '',
}

// One modal used for both creating a new main task and editing an existing one.
export default function TaskModal({ mode, task, onClose, onSave }) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        name: task.name,
        vendor: task.vendor || '',
        category: task.category || '',
        description: task.description || '',
        due: task.due || '',
        priority: task.priority || 'Medium',
        manualStatus: task.manualStatus || 'Not Started',
        notes: task.notes || '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [mode, task])

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Task name is required.')
      return
    }
    onSave({
      ...form,
      name: form.name.trim(),
      vendor: form.vendor.trim(),
      category: form.category.trim() || 'General',
    })
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={mode === 'edit' ? 'Edit task' : 'Add task'} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{mode === 'edit' ? 'Edit main task' : 'Add main task'}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            {'\u2715'}
          </button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <label className="field">
            <span>Main task name *</span>
            <input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Vendor SOW renewal" autoFocus />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Vendor</span>
              <input value={form.vendor} onChange={(e) => update({ vendor: e.target.value })} placeholder="e.g. TCS" />
            </label>
            <label className="field">
              <span>Category</span>
              <input value={form.category} onChange={(e) => update({ category: e.target.value })} placeholder="e.g. Addendum" />
            </label>
          </div>

          <label className="field">
            <span>Description</span>
            <textarea value={form.description} onChange={(e) => update({ description: e.target.value })} rows={2} placeholder="Short summary of this task" />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Due date</span>
              <input type="date" value={form.due} onChange={(e) => update({ due: e.target.value })} />
            </label>
            <label className="field">
              <span>Priority</span>
              <select value={form.priority} onChange={(e) => update({ priority: e.target.value })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Initial status</span>
              <select value={form.manualStatus} onChange={(e) => update({ manualStatus: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Notes</span>
            <textarea value={form.notes} onChange={(e) => update({ notes: e.target.value })} rows={2} placeholder="Any additional notes" />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {mode === 'edit' ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
