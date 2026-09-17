// Initial Mizuho PMO tasks. Used only the first time the app runs
// (when localStorage is empty). After that, all data lives in localStorage.

const now = '2026-01-01T00:00:00.000Z'

function todo(id, text) {
  return {
    id,
    text,
    done: false,
    notes: '',
    due: '',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}

function task(base) {
  return {
    description: '',
    priority: 'Medium',
    due: '',
    notes: '',
    // manualStatus is the user-chosen status. The effective status is derived
    // from to-do progress (see lib/status.js) unless overridden here.
    manualStatus: 'Not Started',
    createdAt: now,
    updatedAt: now,
    ...base,
  }
}

export const seedTasks = [
  task({
    id: 'seed-1',
    name: 'PIR',
    vendor: 'Internal',
    category: 'Review',
    due: '2026-10-01',
    items: [
      todo('seed-1-1', 'Check across all contracts for PIR due this year'),
      todo('seed-1-2', 'Check if renewal or existing'),
    ],
  }),
  task({
    id: 'seed-2',
    name: 'Synechron Data Entry Staff Aug SOW',
    vendor: 'Synechron',
    category: 'SOW',
    items: [
      todo('seed-2-1', 'Pending SOC/OSPAR from Synechron'),
      todo('seed-2-2', 'Pending AML PEGA approval'),
      todo('seed-2-3', 'Yet to start on AFA'),
    ],
  }),
  task({
    id: 'seed-3',
    name: 'Synechron VBA Expert Staff Aug SOW',
    vendor: 'Synechron',
    category: 'SOW',
    items: [
      todo('seed-3-1', 'Pending SOC/OSPAR from Synechron'),
      todo('seed-3-2', 'Pending AML PEGA approval'),
      todo('seed-3-3', 'Yet to start on AFA'),
    ],
  }),
  task({
    id: 'seed-4',
    name: 'Microsoft HO Form 3.1',
    vendor: 'Microsoft',
    category: 'HO Form',
    items: [todo('seed-4-1', 'Yet to start')],
  }),
  task({
    id: 'seed-5',
    name: 'TCS MIBO BAU IT OPS Addendum 3 - Tenable & PowerBI',
    vendor: 'TCS',
    category: 'Addendum',
    items: [
      todo('seed-5-1', 'Addendum 3 pending AFA for contract'),
      todo('seed-5-2', 'AFA for investment PEGA approval'),
    ],
  }),
  task({
    id: 'seed-6',
    name: 'TCS MIBO BAU IT OPS Addendum 4 - Mail migration',
    vendor: 'TCS',
    category: 'Addendum',
    items: [
      todo('seed-6-1', 'TPRM review'),
      todo('seed-6-2', 'HOIT Review'),
      todo('seed-6-3', 'Legal Review'),
      todo('seed-6-4', 'Make Pega'),
    ],
  }),
  task({
    id: 'seed-7',
    name: 'NEC pilot 3 Yr TPA/REDD',
    vendor: 'NEC',
    category: 'Contract',
    items: [todo('seed-7-1', 'Pending TPA amendment')],
  }),
  task({
    id: 'seed-8',
    name: 'MGS LAPTOP MAKE CONTRACT',
    vendor: 'MGS',
    category: 'Contract',
    items: [],
  }),
]
