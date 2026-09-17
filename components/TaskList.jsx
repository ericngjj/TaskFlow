import React, { useMemo } from 'react'
import { STATUS, STATUS_LIST, PRIORITIES, statusOf, progressOf, isTaskOverdue } from '../data.js'

function StatusPill({ status }) {
  const cls =
    status === STATUS.COMPLETED
      ? 'completed'
      : status === STATUS.IN_PROGRESS
        ? 'in-progress'
        : status === STATUS.ON_HOLD
          ? 'on-hold'
          : 'not-started'
  return <span className={`pill ${cls}`}>{status}</span>
}

function PriorityPill({ priority }) {
  return <span className={`pill prio prio-${priority.toLowerCase()}`}>{priority}</span>
}

export default function TaskList({
  tasks,
  selectedId,
  onSelect,
  onAddTask,
  q,
  setQ,
  statusFilter,
  setStatusFilter,
  vendorFilter,
  setVendorFilter,
  priorityFilter,
  setPriorityFilter,
  sort,
  setSort,
}) {
  const vendors = useMemo(() => {
    const set = new Set(tasks.map((t) => t.vendor).filter(Boolean))
    return Array.from(set).sort()
  }, [tasks])

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = tasks.filter((t) => {
      const matchQ =
        !query || `${t.name} ${t.vendor} ${t.category} ${t.description}`.toLowerCase().includes(query)
      const matchStatus = statusFilter === 'All' || statusOf(t) === statusFilter
      const matchVendor = vendorFilter === 'All' || t.vendor === vendorFilter
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter
      return matchQ && matchStatus && matchVendor && matchPriority
    })

    list = [...list]
    if (sort === 'due') {
      list.sort((a, b) => {
        if (!a.due && !b.due) return 0
        if (!a.due) return 1
        if (!b.due) return -1
        return a.due.localeCompare(b.due)
      })
    } else if (sort === 'updated') {
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    }
    return list
  }, [tasks, q, statusFilter, vendorFilter, priorityFilter, sort])

  return (
    <div className="panel list">
      <div className="toolbar">
        <input
          placeholder="Search tasks..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search tasks"
        />
        <button onClick={onAddTask}>+ Add Task</button>
      </div>

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="All">All statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} aria-label="Filter by vendor">
          <option value="All">All vendors</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tasks">
          <option value="none">Default order</option>
          <option value="due">Sort by due date</option>
          <option value="updated">Recently updated</option>
        </select>
      </div>

      <div className="taskrows">
        {visible.length === 0 && <div className="empty">No tasks match your filters.</div>}
        {visible.map((t) => {
          const st = statusOf(t)
          const prog = progressOf(t)
          const overdue = isTaskOverdue(t)
          return (
            <button
              key={t.id}
              className={`taskrow ${t.id === selectedId ? 'chosen' : ''} ${overdue ? 'overdue' : ''}`}
              onClick={() => onSelect(t.id)}
            >
              <span className="rowmain">
                <strong>{t.name}</strong>
                <small>
                  {t.vendor || 'No vendor'} · {t.category}
                  {t.items.length ? ` · ${prog.done}/${prog.total} to-do` : ' · no to-do items'}
                  {overdue ? ' · overdue' : ''}
                </small>
              </span>
              <span className="rowright">
                <StatusPill status={st} />
                <PriorityPill priority={t.priority} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
