'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BanknotesIcon,
  CreditCardIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import {
  FinanceDataManager,
} from '@/lib/supabaseDataManager'
import { BankAccount } from '@/types/finance'
import { useNotification } from '@/contexts/NotificationContext'

interface IncomeEntry {
  amount: number
  description: string
  date: string
  type: 'cash' | 'non-cash'
  bankAccount?: string
  category: string
}

export default function IncomePage() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [income, setIncome] = useState<IncomeEntry>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'cash',
    category: 'business'
  })

  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  const financeManager = FinanceDataManager.getInstance()

  // Initialize data on component mount
  useEffect(() => {
    const loadData = async () => {
      await financeManager.initialize()
      const accounts = await financeManager.getAccounts()
      // Map to shared BankAccount interface if needed or cast
      setBankAccounts(accounts as BankAccount[])
    }
    loadData()
  }, [])

  const incomeCategories = [
    'business',
    'salary',
    'investment',
    'others'
  ]

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
        category: 'business'
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

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
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="icon-golden-card">
              <PlusIcon className="h-6 w-6 icon-white" />
            </div>
          </div>
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
                {incomeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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

            {/* Date */}
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
                  Adding Income...
                </>
              ) : (
                'Add Income'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}