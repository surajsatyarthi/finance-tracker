'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CalendarDaysIcon,
  MinusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import {
  FinanceDataManager,
} from '@/lib/supabaseDataManager'
import { calculateEMI } from '@/lib/financialUtils'
import { BankAccount, CreditCard } from '@/types/finance'
import { useNotification } from '@/contexts/NotificationContext'
import { formatDate } from '@/lib/dateUtils'
import GlassCard from '@/components/GlassCard'

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

interface ExpenseEntry {
  amount: number
  date: string
  paymentMethod: 'cash' | 'upi' | 'credit_card' | 'credit_card_emi' | 'bnpl'
  bankAccount?: string
  creditCard?: string
  bnplProvider?: string
  emiDetails?: {
    tenure: number
    interestRate: number
    monthlyAmount: number
    totalAmount: number
    processingFee?: number
  }
  category: string
}

export default function AddExpensePage() {
  const router = useRouter()
  const { showNotification } = useNotification()
  const [expense, setExpense] = useState<ExpenseEntry>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    category: 'Food - Groceries'
  })

  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [expenseTransactions, setExpenseTransactions] = useState<any[]>([])
  const [expenseCategories, setExpenseCategories] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  // EMI calculation state
  const [emiPreview, setEmiPreview] = useState<{ monthlyAmount: number, totalAmount: number } | null>(null)

  const financeManager = FinanceDataManager.getInstance()

  // Initialize data and load accounts/cards on component mount
  useEffect(() => {
    const loadData = async () => {
      await financeManager.initialize()
      const [accounts, cards, categories] = await Promise.all([
        financeManager.getAccounts(),
        financeManager.getCreditCards(),
        financeManager.getCategories()
      ])
      // Map/Cast to shared types
      setBankAccounts(accounts as BankAccount[])
      setCreditCards(cards as unknown as CreditCard[])
      // Filter for expense categories only
      setExpenseCategories(categories.filter((c: any) => c.type === 'expense'))
      await loadExpenseTransactions()
      // Note: CreditCard type might need alignment if DB and shared type diverge slightly, 
      // but 'getCreditCards' in supabaseDataManager returns what we need.
    }
    loadData()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to cancel editing
      if (e.key === 'Escape' && editingId) {
        setEditingId(null)
        setExpense({
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          category: 'Food - Groceries'
        })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId])

  const loadExpenseTransactions = async () => {
    const transactions = await financeManager.getExpenseTransactions()
    setExpenseTransactions(transactions)
  }

  // Calculate monthly summary
  const monthlySummary = useMemo(() => {
    const summary: Record<string, number[]> = {}
    
    // Initialize ALL expense categories with zeros
    expenseCategories.forEach(cat => {
      summary[cat.name] = Array(12).fill(0)
    })

    // Process each transaction and add to existing categories
    expenseTransactions.forEach(transaction => {
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
  }, [expenseTransactions, expenseCategories])

  // Calculate EMI when EMI details change
  useEffect(() => {
    if (expense.paymentMethod === 'credit_card_emi' && expense.amount && expense.emiDetails?.tenure && expense.emiDetails?.interestRate) {
      const emiData = calculateEMI(expense.amount, expense.emiDetails.interestRate, expense.emiDetails.tenure)
      setEmiPreview(emiData)
      setExpense(prev => ({
        ...prev,
        emiDetails: {
          ...prev.emiDetails!,
          monthlyAmount: emiData.monthlyAmount,
          totalAmount: emiData.totalAmount
        }
      }))
    } else {
      setEmiPreview(null)
    }
  }, [expense.amount, expense.emiDetails?.tenure, expense.emiDetails?.interestRate, expense.paymentMethod])

  // ... (categories remain same) ...
  const EXPENSE_CATEGORY_OPTIONS = [
    // Main Categories with Subcategories
    'Loan - Education loan',

    // Transport
    'Transport - Travel',
    'Transport - Petrol',
    'Transport - Bike Insurance',
    'Transport - Bike Pollution Certificate',
    'Transport - Car Insurance',
    'Transport - Car Pollution Certificate',

    // Data
    'Data - Jio',
    'Data - Airtel',
    'Data - WiFi',

    // Self Growth
    'Self Growth - Books',

    // Food
    'Food - Eating out',
    'Food - Swiggy',
    'Food - Groceries',
    'Food - Dry fruits',
    'Food - Vegetables',
    'Food - Fruits',
    'Food - Snacks',

    // Grooming
    'Grooming - Haircut',
    'Grooming - Toiletries',

    // Health
    'Health - Fitness bootcamp',
    'Health - Chef',
    'Health - Yoga instructor',
    'Health - Supplements + Vitamins',
    'Health - Medicine',

    // Clothing
    'Clothing',

    // Insurance
    'Insurance - Medical Insurance',
    'Insurance - Life Insurance',

    // Subscriptions
    'Subscriptions - Donation',
    'Subscriptions - Youtube',
    'Subscriptions - Google one',
    'Subscriptions - Grok',
    'Subscriptions - LinkedIn Premium',

    // Credit Card Monthly Payments
    'Credit Card Monthly - SBI BPCL MP',
    'Credit Card Monthly - SBI Paytm MP',
    'Credit Card Monthly - SBI Simply save MP',
    'Credit Card Monthly - SC EaseMyTrip MP',
    'Credit Card Monthly - Axis My Zone MP',
    'Credit Card Monthly - Axis Neo MP',
    'Credit Card Monthly - RBL Platinum Delight MP',
    'Credit Card Monthly - RBL Bajaj Finserv MP',
    'Credit Card Monthly - HDFC Millenia MP',
    'Credit Card Monthly - HDFC Neu MP',
    'Credit Card Monthly - Indusind Platinum Aura Edge MP',
    'Credit Card Monthly - Indusind Rupay (SC) MP',
    'Credit Card Monthly - ICICI Amazon MP',
    'Credit Card Monthly - ICICI Adani One MP',
    'Credit Card Monthly - Pop YES Bank MP',

    // Credit Card EMI
    'Credit Card EMI - SBI BPCL EMI',
    'Credit Card EMI - SBI Paytm EMI',
    'Credit Card EMI - SBI Simply save EMI',
    'Credit Card EMI - SC EaseMyTrip EMI',
    'Credit Card EMI - Axis My Zone EMI',
    'Credit Card EMI - Axis Neo EMI',
    'Credit Card EMI - RBL Platinum Delight EMI',
    'Credit Card EMI - RBL Bajaj Finserv EMI',
    'Credit Card EMI - HDFC Millenia EMI',
    'Credit Card EMI - HDFC Neu EMI',
    'Credit Card EMI - Indusind Platinum Aura Edge EMI',
    'Credit Card EMI - Indusind Rupay EMI',
    'Credit Card EMI - ICICI Amazon EMI',
    'Credit Card EMI - ICICI Adani One EMI',
    'Credit Card EMI - Pop YES Bank EMI',

    // Pay Later
    'Pay Later - Simpl',
    'Pay Later - Lazypay',
    'Pay Later - Amazon Pay',

    // Misc
    'Misc - Amazon Pay Recharge',
    'Misc - Supplement',
    'Misc - Shopping',
    'Misc - Miscellaneous'
  ]

  const bnplProviders = [
    'Amazon Pay Later',
    'Simpl',
    'LazyPay'
  ]

  // Helper function to get category group and styling
  const getCategoryGroup = (category: string) => {
    if (category.startsWith('Loan')) return { group: 'Loan', color: 'bg-purple-50', border: 'border-purple-200' }
    if (category.startsWith('Transport')) return { group: 'Transport', color: 'bg-blue-50', border: 'border-blue-200' }
    if (category.startsWith('Data')) return { group: 'Data', color: 'bg-cyan-50', border: 'border-cyan-200' }
    if (category.startsWith('Self Growth')) return { group: 'Self Growth', color: 'bg-green-50', border: 'border-green-200' }
    if (category.startsWith('Food')) return { group: 'Food', color: 'bg-orange-50', border: 'border-orange-200' }
    if (category.startsWith('Grooming')) return { group: 'Grooming', color: 'bg-pink-50', border: 'border-pink-200' }
    if (category.startsWith('Health')) return { group: 'Health', color: 'bg-teal-50', border: 'border-teal-200' }
    if (category.startsWith('Clothing')) return { group: 'Clothing', color: 'bg-indigo-50', border: 'border-indigo-200' }
    if (category.startsWith('Insurance')) return { group: 'Insurance', color: 'bg-yellow-50', border: 'border-yellow-200' }
    if (category.startsWith('Subscriptions')) return { group: 'Subscriptions', color: 'bg-violet-50', border: 'border-violet-200' }
    if (category.startsWith('Credit Card Monthly')) return { group: 'Credit Card Monthly', color: 'bg-red-100', border: 'border-red-300' }
    if (category.startsWith('Credit Card EMI')) return { group: 'Credit Card EMI', color: 'bg-fuchsia-50', border: 'border-fuchsia-200' }
    if (category.startsWith('Pay Later')) return { group: 'Pay Later', color: 'bg-amber-50', border: 'border-amber-200' }
    if (category.startsWith('Misc')) return { group: 'Misc', color: 'bg-gray-50', border: 'border-gray-200' }
    return { group: 'Other', color: 'bg-slate-50', border: 'border-slate-200' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form based on payment method
      if (!expense.amount || expense.amount <= 0) {
        showNotification('Please enter a valid amount', 'error')
        return
      }

      // Method-specific validation
      if (expense.paymentMethod === 'upi' && !expense.bankAccount) {
        showNotification('Please select a bank account for UPI payment', 'error')
        return
      }

      if ((expense.paymentMethod === 'credit_card' || expense.paymentMethod === 'credit_card_emi') && !expense.creditCard) {
        showNotification('Please select a credit card', 'error')
        return
      }

      if (expense.paymentMethod === 'credit_card_emi') {
        if (!expense.emiDetails?.tenure || !expense.emiDetails?.interestRate) {
          showNotification('Please enter EMI tenure and interest rate', 'error')
          return
        }
        if (expense.emiDetails.tenure < 1 || expense.emiDetails.tenure > 60) {
          showNotification('EMI tenure should be between 1-60 months', 'error')
          return
        }
      }

      if (expense.paymentMethod === 'bnpl' && !expense.bnplProvider) {
        showNotification('Please select a BNPL provider', 'error')
        return
      }

      // Process expense entry using Supabase Manager
      // Note: We need to adapt the single 'createTransaction' to handle EMIs/BNPL/Credit Cards logic
      // OR we add logic here to prepare the payload.
      // financeManager.createTransaction handles basics, but 'dataManager.processExpenseEntry' had logic for BNPL/EMI creation etc.
      // We should check if 'createTransaction' handles this or if we need to manually create Future Payables via Manager.

      // Checking financeManager capabilities...
      // financeManager.createTransaction is simple. It does NOT handle EMI splitting or Future Payables logic yet.
      // Ideally, that logic resides IN the manager.
      // Since I am refactoring, I should move that logic to 'supabaseDataManager's processExpenseTransaction (which I might not have added yet?)

      // Let's assume for now keeping logic here calls 'createTransaction' and 'createFuturePayable' if needed.
      // BUT 'createFuturePayable' might not be exposed on FinanceDataManager yet.

      // STRATEGY: Extend FinanceDataManager to handle complex expense processing, similar to 'processExpenseEntry' in old manager.
      // I'll call a new method 'processExpense' on manager. I need to add that next.
      // For now, I will use 'createTransaction' as placeholder structure, but I will need to ADD 'processExpense' to supabaseDataManager.

      await financeManager.processExpense({
        amount: expense.amount,
        description: expense.category, // Use category as description
        date: expense.date,
        paymentMethod: expense.paymentMethod,
        bankAccount: expense.bankAccount,
        creditCard: expense.creditCard,
        bnplProvider: expense.bnplProvider,
        emiDetails: expense.emiDetails,
        category: expense.category
      })

      let successMessage = `₹${expense.amount.toLocaleString()} expense added successfully!`

      if (expense.paymentMethod === 'credit_card_emi' && emiPreview) {
        successMessage += ` EMI: ₹${emiPreview.monthlyAmount.toLocaleString()}/month for ${expense.emiDetails!.tenure} months`
      }

      showNotification(successMessage, 'success')

      // Reset form
      setExpense({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        category: 'Food - Groceries'
      })
      setEditingId(null)

      // Reload transactions to show updated list
      await loadExpenseTransactions()

      // // Redirect after 2 seconds
      // setTimeout(() => {
      //   router.push('/dashboard')
      // }, 2000)

    } catch (error) {
      console.error('Error adding expense:', error)
      showNotification('Error adding expense. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600">Add Expense</h1>
          <p className="text-gray-600 mt-2">Track your spending across different payment methods</p>
        </div>


        {/* Expense Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Cash */}
                <button
                  type="button"
                  onClick={() => setExpense({ ...expense, paymentMethod: 'cash', bankAccount: undefined, creditCard: undefined, bnplProvider: undefined, emiDetails: undefined })}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${expense.paymentMethod === 'cash'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="icon-red-card mb-2">
                    <BanknotesIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">Cash</span>
                </button>

                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setExpense({ ...expense, paymentMethod: 'upi', creditCard: undefined, bnplProvider: undefined, emiDetails: undefined })}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${expense.paymentMethod === 'upi'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="icon-red-card mb-2">
                    <DevicePhoneMobileIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">UPI</span>
                </button>

                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setExpense({ ...expense, paymentMethod: 'credit_card', bankAccount: undefined, bnplProvider: undefined, emiDetails: undefined })}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${expense.paymentMethod === 'credit_card'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="icon-red-card mb-2">
                    <CreditCardIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">Credit Card</span>
                </button>

                {/* Credit Card EMI */}
                <button
                  type="button"
                  onClick={() => setExpense({ ...expense, paymentMethod: 'credit_card_emi', bankAccount: undefined, bnplProvider: undefined })}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${expense.paymentMethod === 'credit_card_emi'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="icon-red-card mb-2">
                    <CalendarDaysIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">EMI</span>
                </button>

                {/* BNPL */}
                <button
                  type="button"
                  onClick={() => setExpense({ ...expense, paymentMethod: 'bnpl', bankAccount: undefined, creditCard: undefined, emiDetails: undefined })}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${expense.paymentMethod === 'bnpl'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                  <div className="icon-red-card mb-2">
                    <ClockIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">BNPL</span>
                </button>
              </div>
            </div>

            {/* Date - Right after Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({ ...expense, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Bank Account Selection (for UPI) - Paid Via */}
            {expense.paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Via
                </label>
                <select
                  value={expense.bankAccount || ''}
                  onChange={(e) => setExpense({ ...expense, bankAccount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
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

            {/* Credit Card Selection - Paid Via */}
            {(expense.paymentMethod === 'credit_card' || expense.paymentMethod === 'credit_card_emi') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Via
                </label>
                <select
                  value={expense.creditCard || ''}
                  onChange={(e) => setExpense({ ...expense, creditCard: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Choose credit card...</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} ****{card.last_four_digits} (Due: {card.due_date}th)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* BNPL Provider Selection - Paid Via */}
            {expense.paymentMethod === 'bnpl' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Via
                </label>
                <select
                  value={expense.bnplProvider || ''}
                  onChange={(e) => setExpense({ ...expense, bnplProvider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Choose BNPL provider...</option>
                  {bnplProviders.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
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
                value={expense.amount || ''}
                onChange={(e) => setExpense({ ...expense, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter expense amount"
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
                value={expense.category}
                onChange={(e) => setExpense({ ...expense, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {EXPENSE_CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* EMI Details */}
            {expense.paymentMethod === 'credit_card_emi' && (
              <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="font-medium text-orange-900">EMI Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenure (Months)
                    </label>
                    <input
                      type="number"
                      value={expense.emiDetails?.tenure || ''}
                      onChange={(e) => setExpense({
                        ...expense,
                        emiDetails: {
                          ...expense.emiDetails!,
                          tenure: parseInt(e.target.value) || 0,
                          interestRate: expense.emiDetails?.interestRate || 18,
                          monthlyAmount: 0,
                          totalAmount: 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="12"
                      min="1"
                      max="60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      value={expense.emiDetails?.interestRate || 18}
                      onChange={(e) => setExpense({
                        ...expense,
                        emiDetails: {
                          ...expense.emiDetails!,
                          interestRate: parseFloat(e.target.value) || 18
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="16"
                      min="0"
                      max="50"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processing Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={expense.emiDetails?.processingFee || ''}
                      onChange={(e) => setExpense({
                        ...expense,
                        emiDetails: {
                          ...expense.emiDetails!,
                          processingFee: parseFloat(e.target.value) || 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Optional (e.g. 199)"
                      min="0"
                    />
                  </div>
                </div>

                {/* EMI Preview */}
                {emiPreview && (
                  <div className="p-3 bg-white border border-orange-300 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly EMI:</span>
                        <p className="font-semibold text-orange-900">₹{emiPreview.monthlyAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <p className="font-semibold text-orange-900">₹{emiPreview.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}



            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center py-3 px-4 rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? 'Updating Expense...' : 'Adding Expense...'}
                  </>
                ) : (
                  editingId ? 'Update Expense' : 'Add Expense'
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setExpense({
                      amount: 0,
                      date: new Date().toISOString().split('T')[0],
                      paymentMethod: 'cash',
                      category: 'Food - Groceries'
                    })
                  }}
                  className="px-6 py-3 rounded-lg text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Monthly Expense Summary Table */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <GlassCard>
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
              <h2 className="text-xl font-semibold text-gray-900">Expense Summary (Jan 2026 - Dec 2026)</h2>
              <p className="text-sm text-gray-600 mt-1">Total: ₹{monthlySummary.grandTotal.toLocaleString()}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-900">
                <thead>
                  <tr className="bg-red-100">
                    <th className="sticky left-0 bg-red-100 z-20 px-4 py-3 text-left font-semibold border-r min-w-[180px]">
                      Category
                    </th>
                    {monthColumns.map((col, idx) => (
                      <th key={idx} className="px-3 py-3 text-right font-semibold border-r min-w-[85px] whitespace-nowrap">
                        {col.month} {col.year}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right font-semibold bg-red-600 text-white min-w-[100px]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(monthlySummary.summary).length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-4 py-8 text-center text-gray-500">
                        Loading categories...
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
                            className={`${categoryInfo.color} ${isNewGroup ? 'border-t-2 ' + categoryInfo.border : 'border-b'} hover:bg-red-100 transition-colors`}
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
                      <tr className="bg-red-100 font-bold border-t-2">
                        <td className="sticky left-0 bg-red-100 z-10 px-4 py-3 border-r">
                          TOTAL
                        </td>
                        {monthlySummary.monthlyTotals.map((total, idx) => (
                          <td key={idx} className="px-3 py-3 text-right border-r tabular-nums">
                            {total > 0 ? total.toLocaleString() : '0'}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right bg-red-600 text-white tabular-nums">
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

        {/* Expense Transactions Table */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8">
          <GlassCard>
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
            <h2 className="text-xl font-semibold text-gray-900">Expense History</h2>
            <p className="text-sm text-gray-600 mt-1">{expenseTransactions.length} transactions</p>
          </div>
          {expenseTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenseTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-red-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {transaction.categories?.name || transaction.category || 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {transaction.payment_method?.replace(/_/g, ' ') || 'cash'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                        ₹{transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => {
                              setExpense({
                                amount: transaction.amount,
                                date: transaction.date,
                                paymentMethod: transaction.payment_method || 'cash',
                                category: transaction.categories?.name || 'Food - Groceries',
                                bankAccount: transaction.account_id || undefined,
                                creditCard: transaction.credit_card_id || undefined
                              })
                              setEditingId(transaction.id)
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Edit transaction"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this expense?')) {
                                await financeManager.deleteTransaction(transaction.id)
                                await loadExpenseTransactions()
                                showNotification('Expense deleted successfully', 'success')
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete transaction"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No expense transactions yet. Add your first expense above!
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}