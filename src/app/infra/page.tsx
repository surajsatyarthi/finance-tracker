'use client'

import { useEffect, useState } from 'react'

type ServiceRecord = {
  id: string
  name: string
  projectUrl: string
  dashboardUrl: string
  owner: string
  billingEmail: string
  plan: string
  monthlyCost: number
}

const STORAGE_KEY = 'infra_services'

export default function InfraRecordsPage() {
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [form, setForm] = useState<Omit<ServiceRecord, 'id'>>({
    name: '',
    projectUrl: '',
    dashboardUrl: '',
    owner: '',
    billingEmail: '',
    plan: '',
    monthlyCost: 0,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setServices(raw ? JSON.parse(raw) : [])
    } catch {
      setServices([])
    }
  }, [])

  const persist = (next: ServiceRecord[]) => {
    setServices(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const resetForm = () => {
    setForm({
      name: '',
      projectUrl: '',
      dashboardUrl: '',
      owner: '',
      billingEmail: '',
      plan: '',
      monthlyCost: 0,
    })
    setEditingId(null)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: ServiceRecord = {
      id: editingId ?? `svc_${Date.now()}`,
      ...form,
    }
    const next = editingId
      ? services.map((s) => (s.id === editingId ? payload : s))
      : [...services, payload]
    persist(next)
    resetForm()
  }

  const onEdit = (id: string) => {
    const s = services.find((x) => x.id === id)
    if (!s) return
    setForm({
      name: s.name,
      projectUrl: s.projectUrl,
      dashboardUrl: s.dashboardUrl,
      owner: s.owner,
      billingEmail: s.billingEmail,
      plan: s.plan,
      monthlyCost: s.monthlyCost,
    })
    setEditingId(id)
  }

  const onDelete = (id: string) => {
    const next = services.filter((s) => s.id !== id)
    persist(next)
    if (editingId === id) resetForm()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Infra Records</h1>
          <p className="text-gray-600">Store non-secret metadata for Git, Vercel, Supabase and similar services.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Service name (e.g., Vercel)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Project URL"
              value={form.projectUrl}
              onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Dashboard URL"
              value={form.dashboardUrl}
              onChange={(e) => setForm({ ...form, dashboardUrl: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Owner"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Billing email"
              value={form.billingEmail}
              onChange={(e) => setForm({ ...form, billingEmail: e.target.value })}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Plan (e.g., Pro)"
              value={form.plan}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
            />
            <input
              type="number"
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Monthly cost (₹)"
              value={form.monthlyCost}
              onChange={(e) => setForm({ ...form, monthlyCost: Number(e.target.value) })}
              min={0}
            />
            <div className="flex gap-3 mt-2">
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">
                {editingId ? 'Update Service' : 'Add Service'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg border">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dashboard</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billing Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Cost</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-6 py-3 text-sm text-indigo-600">
                      {s.projectUrl ? (
                        <a href={s.projectUrl} target="_blank" rel="noreferrer">Project</a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-indigo-600">
                      {s.dashboardUrl ? (
                        <a href={s.dashboardUrl} target="_blank" rel="noreferrer">Dashboard</a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">{s.owner || '-'}</td>
                    <td className="px-6 py-3 text-sm">{s.billingEmail || '-'}</td>
                    <td className="px-6 py-3 text-sm">{s.plan || '-'}</td>
                    <td className="px-6 py-3 text-sm">₹ {new Intl.NumberFormat('en-IN').format(s.monthlyCost || 0)}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border" onClick={() => onEdit(s.id)}>Edit</button>
                        <button className="px-3 py-1 rounded border text-red-600" onClick={() => onDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={8}>No services added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

