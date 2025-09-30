'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BanknotesIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  ClockIcon,
  CalendarDaysIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import {
  getBankAccounts,
  getCreditCards,
  processExpenseEntry,
  calculateEMI,
  initializeDefaultData,
  initializeCreditCards,
  BankAccount,
  CreditCard
} from '@/lib/dataManager'
import { useNotification } from '@/contexts/NotificationContext'

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
  
  // EMI calculation state
  const [emiPreview, setEmiPreview] = useState<{monthlyAmount: number, totalAmount: number} | null>(null)

  // Initialize data and load accounts/cards on component mount
  useEffect(() => {
    initializeDefaultData()
    initializeCreditCards()
    setBankAccounts(getBankAccounts())
    setCreditCards(getCreditCards())
  }, [])

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

  const expenseCategories = [
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
    'Credit Card Monthly - Axis Rewards MP',
    'Credit Card Monthly - Axis My Zone MP',
    'Credit Card Monthly - Axis Neo MP',
    'Credit Card Monthly - RBL Platinum Delight MP',
    'Credit Card Monthly - RBL Bajaj Finserv MP',
    'Credit Card Monthly - HDFC Millenia MP',
    'Credit Card Monthly - HDFC Neu MP',
    'Credit Card Monthly - Indusind Platinum Aura Edge MP',
    'Credit Card Monthly - Indusind Rupay (SC) MP',
    'Credit Card Monthly - ICICI Amazon MP',
    'Credit Card Monthly - ICICI Coral Rupay MP',
    'Credit Card Monthly - ICICI Adani One MP',
    'Credit Card Monthly - Pop YES Bank MP',
    
    // Credit Card EMI
    'Credit Card EMI - SBI BPCL EMI',
    'Credit Card EMI - SBI Paytm EMI',
    'Credit Card EMI - SBI Simply save EMI',
    'Credit Card EMI - SC EaseMyTrip EMI',
    'Credit Card EMI - Axis Rewards EMI',
    'Credit Card EMI - Axis My Zone EMI',
    'Credit Card EMI - Axis Neo EMI',
    'Credit Card EMI - RBL Platinum Delight EMI',
    'Credit Card EMI - RBL Bajaj Finserv EMI',
    'Credit Card EMI - HDFC Millenia EMI',
    'Credit Card EMI - HDFC Neu EMI',
    'Credit Card EMI - Indusind Platinum Aura Edge EMI',
    'Credit Card EMI - Indusind Rupay EMI',
    'Credit Card EMI - ICICI Amazon EMI',
    'Credit Card EMI - ICICI Coral Rupay EMI',
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

      // Process expense entry
      await processExpenseEntry({
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

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

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
          <div className="flex justify-center mb-4">
            <div className="icon-golden-card">
              <MinusIcon className="h-6 w-6 icon-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Add Expense</h1>
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
                  onClick={() => setExpense({...expense, paymentMethod: 'cash', bankAccount: undefined, creditCard: undefined, bnplProvider: undefined, emiDetails: undefined})}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    expense.paymentMethod === 'cash'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="icon-golden-card mb-2">
                    <BanknotesIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">Cash</span>
                </button>
                
                {/* UPI */}
                <button
                  type="button"
                  onClick={() => setExpense({...expense, paymentMethod: 'upi', creditCard: undefined, bnplProvider: undefined, emiDetails: undefined})}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    expense.paymentMethod === 'upi'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="icon-golden-card mb-2">
                    <DevicePhoneMobileIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">UPI</span>
                </button>
                
                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setExpense({...expense, paymentMethod: 'credit_card', bankAccount: undefined, bnplProvider: undefined, emiDetails: undefined})}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    expense.paymentMethod === 'credit_card'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="icon-golden-card mb-2">
                    <CreditCardIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">Credit Card</span>
                </button>
                
                {/* Credit Card EMI */}
                <button
                  type="button"
                  onClick={() => setExpense({...expense, paymentMethod: 'credit_card_emi', bankAccount: undefined, bnplProvider: undefined})}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    expense.paymentMethod === 'credit_card_emi'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="icon-golden-card mb-2">
                    <CalendarDaysIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">EMI</span>
                </button>
                
                {/* BNPL */}
                <button
                  type="button"
                  onClick={() => setExpense({...expense, paymentMethod: 'bnpl', bankAccount: undefined, creditCard: undefined, emiDetails: undefined})}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    expense.paymentMethod === 'bnpl'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="icon-golden-card mb-2">
                    <ClockIcon className="h-6 w-6 icon-white" />
                  </div>
                  <span className="text-sm font-medium">BNPL</span>
                </button>
              </div>
            </div>

            {/* Bank Account Selection (for UPI) - Paid Via */}
            {expense.paymentMethod === 'upi' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid Via
                </label>
                <select
                  value={expense.bankAccount || ''}
                  onChange={(e) => setExpense({...expense, bankAccount: e.target.value})}
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
                  onChange={(e) => setExpense({...expense, creditCard: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Choose credit card...</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} ****{card.lastFourDigits} (Due: {card.dueDate}th)
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
                  onChange={(e) => setExpense({...expense, bnplProvider: e.target.value})}
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
                onChange={(e) => setExpense({...expense, amount: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter expense amount"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({...expense, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={expense.category}
                onChange={(e) => setExpense({...expense, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {expenseCategories.map((category) => (
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
                          tenure: expense.emiDetails?.tenure || 12,
                          interestRate: parseFloat(e.target.value) || 18,
                          monthlyAmount: 0,
                          totalAmount: 0
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="18.0"
                      min="0"
                      max="50"
                      step="0.1"
                      required
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
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Expense...
                </>
              ) : (
                'Add Expense'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}