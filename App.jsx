import React, { useEffect, useMemo, useState } from 'react'
import { loadTasks, saveTasks, newId, STATUS } from './data.js'
import SummaryCards from './components/SummaryCards.jsx'
import TaskList from './components/TaskList.jsx'
import TaskDetail from './components/TaskDetail.jsx'
import TaskFormModal from './components/TaskFormModal.jsx'

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [selectedId, setSelectedId] = useState(() => {
    const t = loadTasks()
    return t[0]?.id ?? null
  })

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [vendorFilter, setVendorFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [sort, setSort] = useState('none')

  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit' }

  // Persist to localStorage on every change.
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const active = useMemo(() => tasks.find((t) => t.id === selectedId) || null, [tasks, selectedId])

  // Central updater that stamps updatedAt on any task mutation.
  const updateTask = (id, updater) => {
    setTasks((ts) =>
      ts.map((t) => (t.id === id ? { ...updater(t), updatedAt: new Date().toISOString() } : t)),
    )
  }

  const handleSaveTask = (data) => {
    if (modal?.mode === 'edit' && active) {
      updateTask(active.id, (t) => ({ ...t, ...data }))
    } else {
      const stamp = new Date().toISOString()
      const task = {
        id: newId(),
        name: data.name,
        vendor: data.vendor,
        category: data.category,
        description: data.description,
        notes: data.notes,
        priority: data.priority,
        due: data.due,
        status: data.status || STATUS.NOT_STARTED,
        manualCompleted: data.status === STATUS.COMPLETED,
        createdAt: stamp,
        updatedAt: stamp,
        items: [],
      }
      setTasks((ts) => [task, ...ts])
      setSelectedId(task.id)
    }
    setModal(null)
  }

  const handleDeleteTask = () => {
    if (!active) return
    if (!window.confirm(`Delete "${active.name}"? This cannot be undone.`)) return
    setTasks((ts) => {
      const remaining = ts.filter((t) => t.id !== active.id)
      setSelectedId(remaining[0]?.id ?? null)
      return remaining
    })
  }

  const addItem = (text) => {
    if (!active) return
    updateTask(active.id, (t) => ({
      ...t,
      // Adding a real to-do item clears manual completion so item logic governs.
      manualCompleted: false,
      items: [...t.items, { id: newId(), text, done: false, notes: '', due: '', completedAt: null }],
    }))
  }

  const toggleItem = (itemId) => {
    if (!active) return
    updateTask(active.id, (t) => ({
      ...t,
      items: t.items.map((i) =>
        i.id === itemId
          ? { ...i, done: !i.done, completedAt: !i.done ? new Date().toISOString() : null }
          : i,
      ),
    }))
  }

  const editItem = (itemId, patch) => {
    if (!active) return
    updateTask(active.id, (t) => ({
      ...t,
      items: t.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }))
  }

  const deleteItem = (itemId) => {
    if (!active) return
    updateTask(active.id, (t) => ({ ...t, items: t.items.filter((i) => i.id !== itemId) }))
  }

  const toggleManualComplete = () => {
    if (!active) return
    updateTask(active.id, (t) => ({
      ...t,
      manualCompleted: !t.manualCompleted,
      status: !t.manualCompleted ? STATUS.COMPLETED : STATUS.NOT_STARTED,
    }))
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">◈ TaskFlow</div>
        <div className="nav active">▦ Master Tracker</div>
        <div className="nav">
          ◫ Contracts <span>soon</span>
        </div>
        <div className="nav">
          ◷ Calendar <span>soon</span>
        </div>
        <div className="nav">
          ⚙ Settings <span>soon</span>
        </div>
        <div className="sidefoot">
          PMO workspace
          <br />
          <small>Local MVP · v0.2</small>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <h1>Master Tracker</h1>
            <p>Everything you need to move your PMO work forward.</p>
          </div>
          <div className="profile">EN</div>
        </header>

        <SummaryCards tasks={tasks} />

        <section className="workspace">
          <TaskList
            tasks={tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddTask={() => setModal({ mode: 'add' })}
            q={q}
            setQ={setQ}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            vendorFilter={vendorFilter}
            setVendorFilter={setVendorFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sort={sort}
            setSort={setSort}
          />
          <TaskDetail
            task={active}
            onEditTask={() => setModal({ mode: 'edit' })}
            onDeleteTask={handleDeleteTask}
            onAddItem={addItem}
            onToggleItem={toggleItem}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
            onToggleManualComplete={toggleManualComplete}
          />
        </section>
      </main>

      {modal && (
        <TaskFormModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? active : null}
          onSave={handleSaveTask}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
