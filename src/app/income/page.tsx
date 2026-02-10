'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import type { Category, Account, Transaction } from '@/types/database'

type TransactionWithCategory = Transaction & {
  categories: {
    name: string
  } | null
}

type GroupedData = {
  [month: string]: {
    [category: string]: {
      amount: number
      count: number
    }
  }
}

export default function IncomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [groupedData, setGroupedData] = useState<GroupedData>({})
  const [refreshKey, setRefreshKey] = useState(0)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category_id: '',
    account_id: '',
    notes: ''
  })

  const groupTransactions = useCallback((txns: TransactionWithCategory[]) => {
    const grouped: GroupedData = {}

    txns.forEach(txn => {
      const monthKey = new Date(txn.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
      const categoryName = txn.categories?.name || 'Uncategorized'

      if (!grouped[monthKey]) grouped[monthKey] = {}
      if (!grouped[monthKey][categoryName]) {
        grouped[monthKey][categoryName] = { amount: 0, count: 0 }
      }

      grouped[monthKey][categoryName].amount += txn.amount
      grouped[monthKey][categoryName].count += 1
    })

    setGroupedData(grouped)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .is('deleted_at', null)
        .order('name')
        .limit(1000)

      setCategories((cats || []) as Category[])

      const { data: accs } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')
        .limit(1000)

      setAccounts((accs || []) as Account[])

      const { data: txns } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'income')
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .limit(1000)

      // Supabase returns the joined data, we need to cast it safely
      const typedTxns = (txns || []) as unknown as TransactionWithCategory[]
      setTransactions(typedTxns)
      groupTransactions(typedTxns)
    }

    loadData()
  }, [router, supabase, groupTransactions, refreshKey])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: err } = await supabase.from('transactions').insert({
      user_id: user.id,
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: 'income',
      category_id: formData.category_id || null,
      account_id: formData.account_id || null,
      notes: formData.notes || null,
      is_recurring: false
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category_id: '',
      account_id: '',
      notes: ''
    })

    setLoading(false)
    setLoading(false)
    setRefreshKey(prev => prev + 1)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Income</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total Income: <span className="font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4 sticky top-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Income Entry</h3>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                  <input
                    type="text"
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., Monthly Salary"
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount *</label>
                  <input
                    type="number"
                    id="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="10000"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category_id"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.category_id ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="account_id" className="block text-sm font-medium text-gray-700">Account</label>
                  <select
                    id="account_id"
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.account_id ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                    placeholder="Optional notes"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Adding...' : 'Add Income'}
                </button>
              </form>
            </div>

            {/* Table Section */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Income by Category & Month</h3>
                </div>

                <div className="overflow-x-auto">
                  <div className="max-h-[600px] overflow-y-auto">
                    {Object.keys(groupedData).length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        No income entries found. Add your first entry using the form.
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Month</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Category</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Entries</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {Object.entries(groupedData).map(([month, categories]) => (
                            Object.entries(categories).map(([category, data], idx) => (
                              <tr key={`${month}-${category}`} className="hover:bg-gray-50">
                                {idx === 0 && (
                                  <td
                                    rowSpan={Object.keys(categories).length}
                                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 align-top"
                                  >
                                    {month}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-green-600">
                                  {formatCurrency(data.amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                  {data.count}
                                </td>
                              </tr>
                            ))
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  )
}
