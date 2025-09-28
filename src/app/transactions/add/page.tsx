'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import { 
  PlusIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { sanitizeFinancialInput } from '@/lib/security'

interface TransactionForm {
  type: 'income' | 'expense'
  timestamp: string
  date: string
  item: string
  amount: string
  purpose: string
  paidVia: string
  paymentType: string
  category: string
  subcategory: string
  // Income specific
  source?: string
}

export default function AddTransactionPage() {
  const { user } = useRequireAuth()
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState<TransactionForm>({
    type: 'expense',
    timestamp: new Date().toISOString().slice(0, 16),
    date: new Date().toISOString().slice(0, 10),
    item: '',
    amount: '',
    purpose: '',
    paidVia: '',
    paymentType: '',
    category: '',
    subcategory: '',
    source: ''
  })

  // Income sources
  const incomeSources = [
    'Salary',
    'Freelance',
    'Business',
    'Investment',
    'Bonus',
    'Gift',
    'Refund',
    'Other Income'
  ]

  // Categories from your actual expense data
  const expenseCategories = [
    'Food',
    'Transport', 
    'Health',
    'Shopping',
    'Credit Card',
    'Loan',
    'Miscellaneous',
    'Data',
    'Subscription',
    'Grooming'
  ]

  // Subcategories based on your data
  const subcategoriesByCategory: Record<string, string[]> = {
    'Food': ['Eating out', 'Vegetables', 'Snacks', 'Swiggy', 'Groceries', 'Fruits'],
    'Transport': ['Travel', 'Petrol'],
    'Health': ['Medicine', 'Supliments + Vitamins', 'Supplements'],
    'Shopping': ['Clothing', 'Footwear'],
    'Credit Card': ['Payment'],
    'Loan': ['Home loan', 'Education loan'],
    'Miscellaneous': ['Other'],
    'Data': ['WiFi'],
    'Subscription': ['Donation', 'Software'],
    'Grooming': ['Toiletries']
  }

  // Payment types from your actual data
  const paymentTypes = [
    'Cash',
    'UPI', 
    'Credit Card',
    'Amazon Pay',
    'Simpl'
  ]

  // Paid Via options from your actual data
  const paidViaOptions = [
    'Cash',
    'SBI',
    'CBI', 
    'Jupiter',
    'Slice',
    'Amazon Pay',
    'Simpl',
    // Credit Cards
    'ICICI Amazon',
    'ICICI Adani One',
    'ICICI Coral Rupay',
    'Axis Rewards',
    'Axis Neo',
    'HDFC Neu',
    'Indusind Platinum Aura Edge',
    'SBI BPCL',
    'RBL Platinum Delight'
  ]

  const handleInputChange = (field: keyof TransactionForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTabChange = (tab: 'income' | 'expense') => {
    setActiveTab(tab)
    setFormData(prev => ({
      ...prev,
      type: tab,
      source: tab === 'income' ? prev.source : '',
      purpose: tab === 'expense' ? prev.purpose : '',
      category: tab === 'expense' ? prev.category : '',
      subcategory: tab === 'expense' ? prev.subcategory : '',
      paidVia: tab === 'expense' ? prev.paidVia : '',
      paymentType: tab === 'expense' ? prev.paymentType : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      // Basic client-side validation using security utilities
      const amount = sanitizeFinancialInput.amount(formData.amount)
      const dateIso = sanitizeFinancialInput.date(formData.date)

      if (activeTab === 'income' && !formData.source) {
        throw new Error('Please select an income source')
      }

      if (activeTab === 'expense') {
        if (!formData.purpose || !formData.category || !formData.paidVia || !formData.paymentType) {
          throw new Error('Please complete all expense fields')
        }
      }

      // Simulate API call – replace with a server action/API route wired to Supabase
      await new Promise(resolve => setTimeout(resolve, 800))

      setSuccessMessage(`${activeTab === 'income' ? 'Income' : 'Expense'} added successfully!`)

      // Reset form
      setFormData({
        type: activeTab,
        timestamp: new Date().toISOString().slice(0, 16),
        date: new Date().toISOString().slice(0, 10),
        item: '',
        amount: '',
        purpose: '',
        paidVia: '',
        paymentType: '',
        category: '',
        subcategory: '',
        source: ''
      })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const baseValid = formData.amount && formData.item && formData.date
    if (activeTab === 'income') {
      return baseValid && formData.source
    } else {
      return baseValid && formData.purpose && formData.category && formData.paidVia && formData.paymentType
    }
  }

  return (
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-premium-600 hover:text-premium-800 font-medium transition-colors">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center">
                  <PlusIcon className="h-8 w-8 mr-3 text-primary-600" />
                  Add Transaction
                </h1>
                <p className="text-premium-600 font-medium">Record your income or expenses</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => handleTabChange('expense')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'expense'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                  : 'text-premium-600 hover:bg-white/50'
              }`}
            >
              <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
              Add Expense
            </button>
            <button
              onClick={() => handleTabChange('income')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                  : 'text-premium-600 hover:bg-white/50'
              }`}
            >
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              Add Income
            </button>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-premium border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center">
              {activeTab === 'income' ? (
                <>
                  <BanknotesIcon className="h-6 w-6 mr-3 text-emerald-600" />
                  Income Details
                </>
              ) : (
                <>
                  <CurrencyRupeeIcon className="h-6 w-6 mr-3 text-red-600" />
                  Expense Details
                </>
              )}
            </h2>
            <p className="text-premium-600 mt-2">
              {activeTab === 'income' 
                ? 'Record money coming into your accounts' 
                : 'Track your spending and expenses'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Timestamp and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-premium-700 mb-2">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Timestamp
                </label>
                <input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => handleInputChange('timestamp', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-premium-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-mono"
                  required
                />
              </div>
              
              <div>
                <label className="flex items-center text-sm font-semibold text-premium-700 mb-2">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-premium-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Item */}
            <div>
              <label className="flex items-center text-sm font-semibold text-black mb-2">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Item/Description
              </label>
              <input
                type="text"
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-500"
                placeholder={activeTab === 'income' ? 'e.g., Salary, Freelance payment' : 'e.g., Food, Vegetables, Uber'}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center text-sm font-semibold text-black mb-2">
                <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-semibold">₹</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono text-lg text-black placeholder-gray-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Income Source */}
            {activeTab === 'income' && (
              <div>
                <label className="flex items-center text-sm font-semibold text-black mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                  required
                >
                  <option value="">Select income source...</option>
                  {incomeSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Comprehensive Expense Fields */}
            {activeTab === 'expense' && (
              <>
                {/* Purpose */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-black mb-2">
                    <TagIcon className="h-4 w-4 mr-2" />
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-500"
                    placeholder="e.g., Food: Eating out, Health: Medicine, Transport: Travel"
                    required
                  />
                </div>

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-black mb-2">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        handleInputChange('category', e.target.value)
                        handleInputChange('subcategory', '') // Reset subcategory
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                      required
                    >
                      <option value="">Select category...</option>
                      {expenseCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-black mb-2">
                      <TagIcon className="h-4 w-4 mr-2" />
                      Subcategory
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => handleInputChange('subcategory', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                      disabled={!formData.category}
                      required
                    >
                      <option value="">Select subcategory...</option>
                      {formData.category && subcategoriesByCategory[formData.category]?.map(subcategory => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Paid Via and Payment Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-black mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                      Paid Via
                    </label>
                    <select
                      value={formData.paidVia}
                      onChange={(e) => handleInputChange('paidVia', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                      required
                    >
                      <option value="">Select payment source...</option>
                      {paidViaOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-black mb-2">
                      <BanknotesIcon className="h-4 w-4 mr-2" />
                      Payment Type
                    </label>
                    <select
                      value={formData.paymentType}
                      onChange={(e) => handleInputChange('paymentType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                      required
                    >
                      <option value="">Select payment type...</option>
                      {paymentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={`flex-1 flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                  activeTab === 'income'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding {activeTab}...
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add {activeTab === 'income' ? 'Income' : 'Expense'}
                  </>
                )}
              </button>

              <Link
                href="/expenses"
                className="flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-premium-700 bg-white/80 backdrop-blur-sm border border-premium-200 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                View All Transactions
              </Link>
            </div>
          </form>
        </div>

        {/* Form Preview (Development Helper) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-slate-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Form Data Preview:</h3>
            <pre className="text-xs text-slate-600 bg-white p-3 rounded-lg overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}