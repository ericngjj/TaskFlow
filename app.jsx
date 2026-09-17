import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import { loadTasks, saveTasks, newId, nowIso } from './lib/storage.js'
import SummaryCards from './components/SummaryCards.jsx'
import Toolbar from './components/Toolbar.jsx'
import TaskList, { filterAndSort } from './components/TaskList.jsx'
import TaskDetail from './components/TaskDetail.jsx'
import TaskModal from './components/TaskModal.jsx'

const defaultControls = {
  q: '',
  status: 'All',
  vendor: 'All',
  priority: 'All',
  sort: 'due',
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [selectedId, setSelectedId] = useState(() => tasks[0]?.id ?? null)
  const [controls, setControls] = useState(defaultControls)
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', task }

  // Persist to localStorage on every change.
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const vendors = useMemo(() => {
    const set = new Set(tasks.map((t) => t.vendor || 'Internal'))
    return [...set].sort()
  }, [tasks])

  const visible = useMemo(() => filterAndSort(tasks, controls), [tasks, controls])

  // Keep a valid selection even as filters change.
  const selectedTask = tasks.find((t) => t.id === selectedId) || null
  useEffect(() => {
    if (visible.length === 0) return
    if (!visible.some((t) => t.id === selectedId)) {
      setSelectedId(visible[0].id)
    }
  }, [visible, selectedId])

  // ---- Task mutations ----
  const touch = (task) => ({ ...task, updatedAt: nowIso() })

  const upsertTask = (form) => {
    if (modal?.mode === 'edit') {
      setTasks((ts) => ts.map((t) => (t.id === modal.task.id ? touch({ ...t, ...form }) : t)))
    } else {
      const task = {
        id: newId(),
        ...form,
        items: [],
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      setTasks((ts) => [task, ...ts])
      setSelectedId(task.id)
    }
    setModal(null)
  }

  const deleteTask = (id) => {
    if (!window.confirm('Delete this task and all its to-do items?')) return
    setTasks((ts) => ts.filter((t) => t.id !== id))
  }

  const setManualStatus = (id, status) => {
    setTasks((ts) => ts.map((t) => (t.id === id ? touch({ ...t, manualStatus: status }) : t)))
  }

  // ---- To-do mutations ----
  const mapTask = (id, fn) => setTasks((ts) => ts.map((t) => (t.id === id ? touch(fn(t)) : t)))

  const addTodo = (taskId, text) => {
    mapTask(taskId, (t) => ({
      ...t,
      items: [
        ...t.items,
        { id: newId(), text, done: false, notes: '', due: '', completedAt: null, createdAt: nowIso(), updatedAt: nowIso() },
      ],
    }))
  }

  const toggleTodo = (taskId, itemId) => {
    mapTask(taskId, (t) => ({
      ...t,
      items: t.items.map((i) =>
        i.id === itemId
          ? { ...i, done: !i.done, completedAt: !i.done ? nowIso() : null, updatedAt: nowIso() }
          : i
      ),
    }))
  }

  const editTodo = (taskId, itemId, patch) => {
    mapTask(taskId, (t) => ({
      ...t,
      items: t.items.map((i) => (i.id === itemId ? { ...i, ...patch, updatedAt: nowIso() } : i)),
    }))
  }

  const deleteTodo = (taskId, itemId) => {
    mapTask(taskId, (t) => ({ ...t, items: t.items.filter((i) => i.id !== itemId) }))
  }

  const actions = { addTodo, toggleTodo, editTodo, deleteTodo, deleteTask, setManualStatus }

  return (
    <div className="app">
      <aside>
        <div className="brand">{'\u25C8'} TaskFlow</div>
        <div className="nav active">{'\u25A6'} Master Tracker</div>
        <div className="nav">
          {'\u25AB'} Contracts <span>soon</span>
        </div>
        <div className="nav">
          {'\u25F7'} Calendar <span>soon</span>
        </div>
        <div className="nav">
          {'\u2699'} Settings <span>soon</span>
        </div>
        <div className="sidefoot">
          PMO workspace
          <br />
          <small>Local MVP {'\u00b7'} v0.2</small>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <h1>Master Tracker</h1>
            <p>Everything you need to move your PMO work forward.</p>
          </div>
          <div className="header-right">
            <button className="btn-primary add-task-btn" onClick={() => setModal({ mode: 'add' })}>
              + Add Task
            </button>
            <div className="profile" aria-hidden="true">
              EN
            </div>
          </div>
        </header>

        <SummaryCards tasks={tasks} />

        <section className="workspace">
          <div className="panel list">
            <Toolbar controls={controls} setControls={setControls} vendors={vendors} />
            <TaskList tasks={visible} selectedId={selectedId} onSelect={setSelectedId} />
          </div>

          <TaskDetail task={selectedTask} actions={actions} onEditTask={(task) => setModal({ mode: 'edit', task })} />
        </section>
      </main>

      {modal && (
        <TaskModal
          mode={modal.mode}
          task={modal.task}
          onClose={() => setModal(null)}
          onSave={upsertTask}
        />
      )}
    </div>
  )
}
