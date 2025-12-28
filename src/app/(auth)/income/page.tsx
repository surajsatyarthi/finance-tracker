'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import {
  FinanceDataManager,
} from '@/lib/supabaseDataManager'
import { BankAccount, Category } from '@/types/finance'
import { useNotification } from '@/contexts/NotificationContext'
import { formatDate } from '@/lib/dateUtils'
import GlassCard from '@/components/GlassCard'

interface IncomeEntry {
  amount: number
  description: string
  date: string
  type: 'cash' | 'non-cash'
  bankAccount?: string
  category: string
}

// 12 months: Jan 2026 to Dec 2026
const monthColumns = [
  { month: 'Jan', year: 2026, monthNum: 1 },
  { month: 'Feb', year: 2026, monthNum: 2 },
  { month: 'Mar', year: 2026, monthNum: 3 },
  { month: 'Apr', year: 2026, monthNum: 4 },
  { month: 'May', year: 2026, monthNum: 5 },
  { month: 'Jun', year: 2026, monthNum: 6 },
  { month: 'Jul', year: 2026, monthNum: 7 },
  { month: 'Aug', year: 2026, monthNum: 8 },
  { month: 'Sep', year: 2026, monthNum: 9 },
  { month: 'Oct', year: 2026, monthNum: 10 },
  { month: 'Nov', year: 2026, monthNum: 11 },
  { month: 'Dec', year: 2026, monthNum: 12 },
]

export default function IncomePage() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [income, setIncome] = useState<IncomeEntry>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'cash',
    category: ''
  })

  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const financeManager = FinanceDataManager.getInstance()

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      await financeManager.initialize()
      const [accounts, categories] = await Promise.all([
        financeManager.getAccounts(),
        financeManager.getCategories()
      ])
      setBankAccounts(accounts as BankAccount[])
      // Filter for income categories only
      setIncomeCategories(categories.filter((c: Category) => c.type === 'income'))
      await loadIncomeTransactions()
    }
    loadData()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel editing
      if (e.key === 'Escape' && editingId) {
        setEditingId(null)
        setIncome({
          amount: 0,
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'cash',
          category: ''
        })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId])

  const loadIncomeTransactions = async () => {
    const transactions = await financeManager.getIncomeTransactions()
    setIncomeTransactions(transactions)
  }

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const summary: Record<string, number[]> = {}
    
    // Initialize all categories with zeros
    incomeCategories.forEach(cat => {
      summary[cat.name] = Array(12).fill(0)
    })

    // Process each transaction
    incomeTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const category = transaction.categories?.name || 'Uncategorized'

      // Get month index (0-11) for Jan 2026 to Dec 2026
      let monthIdx = -1
      if (year === 2026 && month >= 1 && month <= 12) {
        monthIdx = month - 1 // Jan = 0, Dec = 11
      }

      if (monthIdx !== -1) {
        if (!summary[category]) {
          summary[category] = Array(12).fill(0)
        }
        summary[category][monthIdx] += transaction.amount
      }
    })

    // Calculate totals
    const monthlyTotals = Array(12).fill(0)
    const categoryTotals: Record<string, number> = {}
    let grandTotal = 0

    Object.entries(summary).forEach(([category, values]) => {
      let catTotal = 0
      values.forEach((val, idx) => {
        monthlyTotals[idx] += val
        catTotal += val
        grandTotal += val
      })
      categoryTotals[category] = catTotal
    })

    return { summary, monthlyTotals, categoryTotals, grandTotal }
  }, [incomeTransactions, incomeCategories])

  // Helper function to get category group and styling
  const getCategoryGroup = (category: string) => {
    if (category.includes('Salary') || category.includes('salary')) return { group: 'Salary', color: 'bg-emerald-50', border: 'border-emerald-200' }
    if (category.includes('Freelance') || category.includes('freelance')) return { group: 'Freelance', color: 'bg-green-50', border: 'border-green-200' }
    if (category.includes('Business') || category.includes('business')) return { group: 'Business', color: 'bg-teal-50', border: 'border-teal-200' }
    if (category.includes('Investment') || category.includes('investment') || category.includes('Interest')) return { group: 'Investment', color: 'bg-cyan-50', border: 'border-cyan-200' }
    if (category.includes('Rental') || category.includes('rental') || category.includes('Rent')) return { group: 'Rental', color: 'bg-blue-50', border: 'border-blue-200' }
    if (category.includes('Gift') || category.includes('gift')) return { group: 'Gift', color: 'bg-purple-50', border: 'border-purple-200' }
    if (category.includes('Refund') || category.includes('refund')) return { group: 'Refund', color: 'bg-amber-50', border: 'border-amber-200' }
    if (category.includes('Bonus') || category.includes('bonus') || category.includes('Incentive')) return { group: 'Bonus', color: 'bg-yellow-50', border: 'border-yellow-200' }
    if (category.includes('Other') || category.includes('other')) return { group: 'Other', color: 'bg-gray-50', border: 'border-gray-200' }
    return { group: 'Uncategorized', color: 'bg-slate-50', border: 'border-slate-200' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!income.amount || income.amount <= 0) {
        showNotification('Please enter a valid amount', 'error')
        return
      }

      if (income.type === 'non-cash' && !income.bankAccount) {
        showNotification('Please select a bank account for non-cash income', 'error')
        return
      }

      // Process income entry using Supabase Manager
      await financeManager.createTransaction({
        amount: income.amount,
        type: 'income',
        description: income.description || 'Income',
        date: income.date,
        payment_method: income.type,
        account_id: income.bankAccount,
        category: income.category
      })

      showNotification(`₹${income.amount.toLocaleString()} ${income.type} income added successfully!`, 'success')

      // Reset form
      setIncome({
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'cash',
        category: ''
      })
      
      setEditingId(null)
      await loadIncomeTransactions()

      // Redirect after 2 seconds
      //setTimeout(() => {
      //  router.push('/dashboard')
      //}, 2000)

    } catch (error) {
      console.error('Error adding income:', error)
      showNotification('Error adding income. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add Income</h1>
          <p className="text-gray-600 mt-2">Track your cash and non-cash earnings</p>
        </div>


        {/* Income Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Income Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Income Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIncome({ ...income, type: 'cash', bankAccount: undefined })}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${income.type === 'cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="icon-golden-card mr-3">
                    <BanknotesIcon className="h-6 w-6 icon-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Cash</p>
                    <p className="text-sm text-gray-500">Physical money</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIncome({ ...income, type: 'non-cash' })}
                  className={`flex items-center p-4 rounded-lg border-2 transition-all ${income.type === 'non-cash'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="icon-golden-card mr-3">
                    <CreditCardIcon className="h-6 w-6 icon-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Non-Cash</p>
                    <p className="text-sm text-gray-500">Bank transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date - 2nd position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={income.date}
                onChange={(e) => setIncome({ ...income, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            {/* Bank Account Selection (for non-cash) */}
            {income.type === 'non-cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank Account
                </label>
                <select
                  value={income.bankAccount || ''}
                  onChange={(e) => setIncome({ ...income, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required={income.type === 'non-cash'}
                >
                  <option value="">Choose bank account...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} (Balance: ₹{account.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={income.amount || ''}
                onChange={(e) => setIncome({ ...income, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter income amount"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={income.category}
                onChange={(e) => setIncome({ ...income, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select Category</option>
                {incomeCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={income.description}
                onChange={(e) => setIncome({ ...income, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of income"
              />
            </div>



            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingId ? 'Updating Income...' : 'Adding Income...'}
                </>
              ) : (
                <>{editingId ? 'Update Income' : 'Add Income'}</>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setIncome({
                    amount: 0,
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    type: 'cash',
                    category: ''
                  })
                }}
                className="w-full py-3 px-4 rounded-lg text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Monthly Income Summary Table */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <GlassCard>
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-semibold text-gray-900">Income Summary (Jan 2026 - Dec 2026)</h2>
            <p className="text-sm text-gray-600 mt-1">Total: ₹{monthlySummary.grandTotal.toLocaleString()}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-900">
              <thead>
                <tr className="bg-green-100">
                  <th className="sticky left-0 bg-green-100 z-20 px-4 py-3 text-left font-semibold border-r min-w-[180px]">
                    Category
                  </th>
                  {monthColumns.map((col, idx) => (
                    <th key={idx} className="px-3 py-3 text-right font-semibold border-r min-w-[85px] whitespace-nowrap">
                      {col.month} {col.year}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold bg-green-600 text-white min-w-[100px]">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(monthlySummary.summary).length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                      No income categories yet. Add income transactions to see the summary.
                    </td>
                  </tr>
                ) : (
                  <>
                    {Object.keys(monthlySummary.summary).sort().map((category, rowIdx) => {
                      const categoryInfo = getCategoryGroup(category)
                      const sortedCategories = Object.keys(monthlySummary.summary).sort()
                      const prevCategory = rowIdx > 0 ? sortedCategories[rowIdx - 1] : null
                      const prevCategoryGroup = prevCategory ? getCategoryGroup(prevCategory).group : null
                      const isNewGroup = prevCategoryGroup !== categoryInfo.group
                      
                      return (
                        <tr
                          key={category}
                          className={`${categoryInfo.color} ${isNewGroup ? 'border-t-2 ' + categoryInfo.border : 'border-b'} hover:bg-green-100 transition-colors`}
                        >
                          <td className={`sticky left-0 z-10 px-4 py-2 border-r font-medium ${categoryInfo.color} ${isNewGroup ? 'pt-3' : ''}`}>
                            {isNewGroup && (
                              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                {categoryInfo.group}
                              </div>
                            )}
                            <div className="text-sm">{category}</div>
                          </td>
                          {monthlySummary.summary[category].map((val, monthIdx) => (
                            <td key={monthIdx} className={`px-3 py-2 text-right border-r tabular-nums ${isNewGroup ? 'pt-3' : ''}`}>
                              {val > 0 ? val.toLocaleString() : '0'}
                            </td>
                          ))}
                          <td className={`px-4 py-2 text-right font-semibold bg-gray-100 tabular-nums ${isNewGroup ? 'pt-3' : ''}`}>
                            {monthlySummary.categoryTotals[category].toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                    {/* Totals Row */}
                    <tr className="bg-green-100 font-bold border-t-2">
                      <td className="sticky left-0 bg-green-100 z-10 px-4 py-3 border-r">
                        TOTAL
                      </td>
                      {monthlySummary.monthlyTotals.map((total, idx) => (
                        <td key={idx} className="px-3 py-3 text-right border-r tabular-nums">
                          {total > 0 ? total.toLocaleString() : '0'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right bg-green-600 text-white tabular-nums">
                        {monthlySummary.grandTotal.toLocaleString()}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Income Transactions Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8">
        <GlassCard>
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <h2 className="text-xl font-semibold text-gray-900">Income History</h2>
            <p className="text-sm text-gray-600 mt-1">{incomeTransactions.length} transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incomeTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{formatDate(transaction.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{transaction.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {transaction.categories?.name || transaction.category || 'Uncategorized'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {transaction.payment_method?.replace(/_/g, ' ') || 'cash'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                      ₹{transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                      <div className="flex gap-2 justify-center">
                        <button 
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" 
                          onClick={() => {
                            setEditingId(transaction.id)
                            setIncome({
                              amount: transaction.amount,
                              description: transaction.description || '',
                              date: transaction.date,
                              type: transaction.payment_method || 'cash',
                              category: transaction.categories?.name || '',
                              bankAccount: transaction.account_id
                            })
                          }}
                          title="Edit transaction"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors" 
                          onClick={async () => {
                            if (confirm('Delete this income transaction?')) {
                              await financeManager.deleteTransaction(transaction.id)
                              await loadIncomeTransactions()
                              showNotification('Income transaction deleted', 'success')
                            }
                          }}
                          title="Delete transaction"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {incomeTransactions.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={6}>
                      No income transactions yet. Add your first income above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}