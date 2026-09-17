import React from 'react'
import { computeStatus, countOverdue } from '../lib/status.js'

export default function SummaryCards({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter((t) => computeStatus(t) === 'Completed').length
  const live = total - completed
  const todoItems = tasks.reduce((n, t) => n + t.items.length, 0)
  const overdue = countOverdue(tasks)

  const cards = [
    { label: 'Total Tasks', value: total, tone: 'default' },
    { label: 'Live Tasks', value: live, tone: 'live' },
    { label: 'Completed Tasks', value: completed, tone: 'completed' },
    { label: 'To-Do Items', value: todoItems, tone: 'default' },
    { label: 'Overdue Items', value: overdue, tone: overdue > 0 ? 'overdue' : 'default' },
  ]

  return (
    <section className="cards" aria-label="Summary">
      {cards.map((c) => (
        <div className={'card card-' + c.tone} key={c.label}>
          <span>{c.label}</span>
          <strong>{c.value}</strong>
        </div>
      ))}
    </section>
  )
}
