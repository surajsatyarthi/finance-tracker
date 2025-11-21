'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/contexts/AuthContext'
import {
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  TagIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { sanitizeFinancialInput } from '@/lib/security'
import { 
  getBankAccounts,
  updateBankAccountBalance,
  updateCashBalance,
  processIncomeEntry,
  processExpenseEntry,
  type BankAccount
} from '@/lib/dataManager'
import { GST_RATES } from '@/lib/businessManager'

interface TransactionForm {
  type: 'income' | 'expense' | 'transfer'
  timestamp: string
  date: string
  item: string
  amount: string
  purpose: string
  paidVia: string
  paymentType: string
  source: string
  fromAccount: string
  toAccount: string
  category: string
  subcategory: string
  // Business fields
  isBusinessExpense: boolean
  gstRate: number
  gstAmount: number
  isGstInclusive: boolean
  invoiceNumber: string
  vendorGstNumber: string
  hsnSacCode: string
  // Recurring
  isRecurring: boolean
  recurringFrequency: 'monthly' | 'quarterly'
}

export default function AddTransactionPage() {
  const { user, loading, LoadingComponent } = useRequireAuth()
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'transfer'>('expense')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accounts, setAccounts] = useState<Array<{id: string, name: string, type: string, account_type: string}>>([])
  const [gstCalculation, setGstCalculation] = useState<{taxable_amount: number, gst_amount: number, total_amount: number} | null>(null)
  const [showBusinessFields, setShowBusinessFields] = useState(false)
  
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
    source: '',
    fromAccount: '',
    toAccount: '',
    // Business fields
    isBusinessExpense: false,
    gstRate: 0,
    gstAmount: 0,
    isGstInclusive: false,
    invoiceNumber: '',
    vendorGstNumber: '',
    hsnSacCode: '',
    // Recurring
    isRecurring: false,
    recurringFrequency: 'monthly'
  })

  // Load accounts on component mount (local-only)
  useEffect(() => {
    const loadData = async () => {
      const localAccounts = getBankAccounts()
      const mapped = localAccounts.map(a => ({ id: a.id, name: a.name, type: a.type, account_type: 'personal' }))
      const withCash = [{ id: 'cash', name: 'Cash', type: 'cash', account_type: 'personal' }, ...mapped]
      setAccounts(withCash)
    }
    loadData()
  }, [])

  // GST disabled in manual-only MVP

  // Income sources array
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

  const handleInputChange = (field: keyof TransactionForm, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTabChange = (tab: 'income' | 'expense' | 'transfer') => {
    setActiveTab(tab)
    setFormData(prev => ({
      ...prev,
      type: tab,
      source: tab === 'income' ? prev.source : '',
      purpose: tab === 'expense' ? prev.purpose : '',
      category: tab === 'expense' ? prev.category : '',
      subcategory: tab === 'expense' ? prev.subcategory : '',
      paidVia: tab === 'expense' ? prev.paidVia : '',
      paymentType: tab === 'expense' ? prev.paymentType : '',
      fromAccount: tab === 'transfer' ? prev.fromAccount : '',
      toAccount: tab === 'transfer' ? prev.toAccount : ''
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

      if (activeTab === 'transfer') {
        if (!formData.fromAccount || !formData.toAccount) {
          throw new Error('Please select both source and destination accounts')
        }
        if (formData.fromAccount === formData.toAccount) {
          throw new Error('Source and destination must differ')
        }
        const amt = parseFloat(formData.amount)
        if (formData.fromAccount === 'cash') {
          updateCashBalance(amt, false)
        } else {
          updateBankAccountBalance(formData.fromAccount, amt, false)
        }
        if (formData.toAccount === 'cash') {
          updateCashBalance(amt, true)
        } else {
          updateBankAccountBalance(formData.toAccount, amt, true)
        }
        setSuccessMessage('Transfer completed successfully!')
      } else if (activeTab === 'income') {
        await processIncomeEntry({
          amount,
          description: formData.item,
          date: dateIso,
          type: formData.paidVia?.toLowerCase() === 'cash' ? 'cash' : 'non-cash',
          bankAccount: formData.paidVia?.toLowerCase() === 'cash' ? undefined : formData.paidVia,
          category: formData.source || 'Income',
          recurring: formData.isRecurring ? { frequency: formData.recurringFrequency } : undefined
        })
        setSuccessMessage('Income added successfully!')
      } else if (activeTab === 'expense') {
        await processExpenseEntry({
          amount,
          description: formData.item,
          date: dateIso,
          paymentMethod: formData.paymentType.toLowerCase() === 'credit' ? 'credit_card' : 
                     formData.paymentType.toLowerCase() === 'debit' ? 'credit_card' : 
                     formData.paymentType.toLowerCase() as 'upi' | 'cash' | 'bnpl',
          bankAccount: formData.paymentType.toLowerCase() === 'upi' ? formData.paidVia : undefined,
          creditCard: formData.paymentType.toLowerCase().includes('credit') ? formData.paidVia : undefined,
          bnplProvider: formData.paymentType.toLowerCase() === 'bnpl' ? formData.paidVia : undefined,
          category: formData.subcategory || formData.category,
          recurring: formData.isRecurring ? { frequency: formData.recurringFrequency } : undefined
        })
        setSuccessMessage('Expense added successfully!')
      }

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
        source: '',
        fromAccount: '',
        toAccount: '',
        isBusinessExpense: false,
        gstRate: 0,
        gstAmount: 0,
        isGstInclusive: false,
        invoiceNumber: '',
        vendorGstNumber: '',
        hsnSacCode: '',
        isRecurring: false,
        recurringFrequency: 'monthly'
      })
      setShowBusinessFields(false)
      setGstCalculation(null)

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
    } else if (activeTab === 'expense') {
      return baseValid && formData.purpose && formData.category && formData.paidVia && formData.paymentType
    } else if (activeTab === 'transfer') {
      return baseValid && formData.fromAccount && formData.toAccount && formData.fromAccount !== formData.toAccount
    }
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
            <button
              onClick={() => handleTabChange('transfer')}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === 'transfer'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                  : 'text-premium-600 hover:bg-white/50'
              }`}
            >
              <BuildingLibraryIcon className="h-5 w-5 mr-2" />
              Transfer
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
              ) : activeTab === 'expense' ? (
                <>
                  <CurrencyRupeeIcon className="h-6 w-6 mr-3 text-red-600" />
                  Expense Details
                </>
              ) : (
                <>
                  <BuildingLibraryIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Transfer Details
                </>
              )}
            </h2>
            <p className="text-premium-600 mt-2">
              {activeTab === 'income' 
                ? 'Record money coming into your accounts' 
                : activeTab === 'expense'
                ? 'Track your spending and expenses'
                : 'Transfer funds between your bank accounts'
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

            {/* Transfer Fields */}
            {activeTab === 'transfer' && (
              <>
                {/* From Account */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-black mb-2">
                    <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                    From Account
                  </label>
                  <select
                    value={formData.fromAccount}
                    onChange={(e) => handleInputChange('fromAccount', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                    required
                  >
                    <option value="">Select source account...</option>
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* To Account */}
                <div>
                  <label className="flex items-center text-sm font-semibold text-black mb-2">
                    <BuildingLibraryIcon className="h-4 w-4 mr-2" />
                    To Account
                  </label>
                  <select
                    value={formData.toAccount}
                    onChange={(e) => handleInputChange('toAccount', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                    required
                  >
                    <option value="">Select destination account...</option>
                    {accounts.filter(account => account.id !== formData.fromAccount).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.type})
                      </option>
                    ))}
                  </select>
                </div>

                {formData.fromAccount && formData.toAccount && formData.fromAccount === formData.toAccount && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                      Source and destination accounts must be different
                    </p>
                  </div>
                )}
              </>
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

                {/* Recurring Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                    />
                    <span className="text-sm text-black">Recurring</span>
                  </div>
                  {formData.isRecurring && (
                    <div>
                      <label className="block text-sm font-semibold text-black mb-2">Frequency</label>
                      <select
                        value={formData.recurringFrequency}
                        onChange={(e) => handleInputChange('recurringFrequency', e.target.value as 'monthly' | 'quarterly')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Business Expense Toggle */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-semibold text-blue-800">Business Expense</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isBusinessExpense}
                        onChange={(e) => {
                          handleInputChange('isBusinessExpense', e.target.checked)
                          setShowBusinessFields(e.target.checked)
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {formData.isBusinessExpense && (
                    <p className="text-sm text-blue-700">
                      This expense will be tracked for business tax purposes and GST calculations
                    </p>
                  )}
                </div>

                {/* Business Fields */}
                {formData.isBusinessExpense && showBusinessFields && (
                  <div className="space-y-4 border rounded-lg p-4 bg-orange-50">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Business & GST Details
                    </h3>

                    {/* Business Categories - Feature not yet implemented */}
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Business Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">Select business category...</option>
                        <option value="general">General Business</option>
                        <option value="marketing">Marketing</option>
                        <option value="office">Office Supplies</option>
                        <option value="travel">Travel & Transport</option>
                      </select>
                    </div>

                    {/* GST Rate */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          GST Rate (%)
                        </label>
                        <select
                          value={formData.gstRate}
                          onChange={(e) => handleInputChange('gstRate', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                        >
                          {GST_RATES.map(rate => (
                            <option key={rate} value={rate}>
                              {rate}% {rate === 0 ? '(Exempt)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          GST Treatment
                        </label>
                        <select
                          value={formData.isGstInclusive ? 'inclusive' : 'exclusive'}
                          onChange={(e) => handleInputChange('isGstInclusive', e.target.value === 'inclusive')}
                          className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                          disabled={formData.gstRate === 0}
                        >
                          <option value="exclusive">GST Extra</option>
                          <option value="inclusive">GST Inclusive</option>
                        </select>
                      </div>
                    </div>

                    {/* GST Calculation Display */}
                    {gstCalculation && formData.gstRate > 0 && (
                      <div className="bg-white border border-orange-200 rounded-md p-3">
                        <h4 className="text-sm font-semibold text-orange-800 mb-2">GST Calculation</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Taxable Amount:</span>
                            <span className="ml-1 font-semibold">₹{gstCalculation.taxable_amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">GST Amount:</span>
                            <span className="ml-1 font-semibold text-orange-600">₹{gstCalculation.gst_amount.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="ml-1 font-semibold">₹{gstCalculation.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Invoice Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          value={formData.invoiceNumber}
                          onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="INV-001"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-orange-700 mb-1">
                          HSN/SAC Code
                        </label>
                        <input
                          type="text"
                          value={formData.hsnSacCode}
                          onChange={(e) => handleInputChange('hsnSacCode', e.target.value)}
                          className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="9981"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Vendor GST Number
                      </label>
                      <input
                        type="text"
                        value={formData.vendorGstNumber}
                        onChange={(e) => handleInputChange('vendorGstNumber', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="22AAAAA0000A1Z5"
                        maxLength={15}
                      />
                    </div>
                  </div>
                )}
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
                    : activeTab === 'expense'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {activeTab === 'transfer' ? 'Processing Transfer...' : `Adding ${activeTab}...`}
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {activeTab === 'income' ? 'Add Income' : activeTab === 'expense' ? 'Add Expense' : 'Process Transfer'}
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
