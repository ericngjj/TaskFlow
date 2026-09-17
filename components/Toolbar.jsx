import React from 'react'
import { STATUSES, PRIORITIES } from '../lib/status.js'

export default function Toolbar({ controls, setControls, vendors }) {
  const update = (patch) => setControls((c) => ({ ...c, ...patch }))

  return (
    <div className="toolbar" role="search">
      <input
        className="search"
        placeholder="Search tasks or vendors..."
        value={controls.q}
        onChange={(e) => update({ q: e.target.value })}
        aria-label="Search tasks"
      />
      <div className="filters">
        <select value={controls.status} onChange={(e) => update({ status: e.target.value })} aria-label="Filter by status">
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={controls.vendor} onChange={(e) => update({ vendor: e.target.value })} aria-label="Filter by vendor">
          <option value="All">All vendors</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select value={controls.priority} onChange={(e) => update({ priority: e.target.value })} aria-label="Filter by priority">
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={controls.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort tasks">
          <option value="due">Sort: Due date</option>
          <option value="updated">Sort: Recently updated</option>
        </select>
      </div>
    </div>
  )
}
