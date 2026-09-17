import React from 'react'
import { isCompleted, overdueCount } from '../data.js'

export default function SummaryCards({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter(isCompleted).length
  const live = total - completed
  const todoItems = tasks.reduce((n, t) => n + t.items.length, 0)
  const overdue = overdueCount(tasks)

  const cards = [
    { label: 'Total Tasks', value: total, tone: '' },
    { label: 'Live Tasks', value: live, tone: 'tone-live' },
    { label: 'Completed', value: completed, tone: 'tone-done' },
    { label: 'To-Do Items', value: todoItems, tone: '' },
    { label: 'Overdue Items', value: overdue, tone: overdue ? 'tone-overdue' : '' },
  ]

  return (
    <section className="cards" aria-label="Summary">
      {cards.map((c) => (
        <div className={`card ${c.tone}`} key={c.label}>
          <span>{c.label}</span>
          <strong>{c.value}</strong>
        </div>
      ))}
    </section>
  )
}
