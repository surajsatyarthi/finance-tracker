'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  CreditCardIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import {
  getCreditCardLiabilitySummary,
  getCreditCards,
  initializeCreditCards,
  updateCreditCardBalance,
  CreditCard as CreditCardType
} from '@/lib/dataManager'

interface ExpenseEntry {
  cardId: string
  amount: number
  description: string
  isEMI: boolean
}

export default function CreditCardLiabilityPage() {
  useRequireAuth()
  
  const [liabilitySummary, setLiabilitySummary] = useState<ReturnType<typeof getCreditCardLiabilitySummary> | null>(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expenseEntry, setExpenseEntry] = useState<ExpenseEntry>({
    cardId: '',
    amount: 0,
    description: '',
    isEMI: false
  })

  // Load data on component mount
  useEffect(() => {
    initializeCreditCards()
    setLiabilitySummary(getCreditCardLiabilitySummary())
  }, [])

  // Refresh liability summary
  const refreshLiability = () => {
    setLiabilitySummary(getCreditCardLiabilitySummary())
  }

  // Handle adding expense to credit card
  const handleAddExpense = async () => {
    if (!expenseEntry.cardId || expenseEntry.amount <= 0) {
      alert('Please select a card and enter a valid amount')
      return
    }

    try {
      // Add expense to credit card balance
      updateCreditCardBalance(expenseEntry.cardId, expenseEntry.amount, true)
      
      // Refresh liability summary
      refreshLiability()
      
      // Reset form
      setExpenseEntry({
        cardId: '',
        amount: 0,
        description: '',
        isEMI: false
      })
      setShowAddExpense(false)
      
      console.log(`Added ₹${expenseEntry.amount} expense to card`)
    } catch (error) {
      console.error('Error adding expense:', error)
      alert('Failed to add expense')
    }
  }

  // Handle making payment to credit card
  const handlePayment = (cardId: string, amount: number) => {
    if (amount <= 0) return
    
    try {
      updateCreditCardBalance(cardId, amount, false)
      refreshLiability()
      console.log(`Made payment of ₹${amount} to card`)
    } catch (error) {
      console.error('Error making payment:', error)
      alert('Failed to make payment')
    }
  }

  const filteredCards = useMemo(() => {
    if (!liabilitySummary) return []
    return liabilitySummary.cards.filter(card => 
      card.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [liabilitySummary, searchTerm])

  if (!liabilitySummary) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Credit Card Liability</h1>
            <p className="text-gray-600 mt-2">Track expenses, dues, and utilization</p>
          </div>
          
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>

        {/* Add Expense Form */}
        {showAddExpense && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Credit Card Expense</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Card
                </label>
                <select
                  value={expenseEntry.cardId}
                  onChange={(e) => setExpenseEntry(prev => ({...prev, cardId: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a card...</option>
                  {getCreditCards().map(card => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={expenseEntry.amount || ''}
                  onChange={(e) => setExpenseEntry(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={expenseEntry.description}
                  onChange={(e) => setExpenseEntry(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Expense description"
                />
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={handleAddExpense}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={expenseEntry.isEMI}
                  onChange={(e) => setExpenseEntry(prev => ({...prev, isEMI: e.target.checked}))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">This is an EMI expense</span>
              </label>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-blue-600">{liabilitySummary.totalCards}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Limit</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{liabilitySummary.totalLimit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{liabilitySummary.totalOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  liabilitySummary.overallUtilization > 70 ? 'bg-red-100 text-red-600' :
                  liabilitySummary.overallUtilization > 30 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  <ChartBarIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className={`text-2xl font-bold ${
                  liabilitySummary.overallUtilization > 70 ? 'text-red-600' :
                  liabilitySummary.overallUtilization > 30 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {liabilitySummary.overallUtilization}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search credit cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Credit Cards Liability Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Credit Card Liabilities ({filteredCards.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Card Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCards.map((card) => {
                  const availableCredit = card.creditLimit - card.currentBalance
                  
                  return (
                    <tr key={card.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{card.name}</div>
                            <div className="text-sm text-gray-500">****{card.lastFourDigits}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{card.creditLimit.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          ₹{card.currentBalance.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ₹{availableCredit.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-16">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  card.utilization > 70 ? 'bg-red-500' :
                                  card.utilization > 30 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(card.utilization, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`ml-2 text-sm font-medium ${
                            card.utilization > 70 ? 'text-red-600' :
                            card.utilization > 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {card.utilization}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-1" />
                          {card.dueDate > 0 ? `${card.dueDate}th` : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credit cards found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No credit cards available.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}