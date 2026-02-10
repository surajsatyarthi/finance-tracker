'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/AppLayout'
import { CreditCard } from '@/types/database'

type AnalysisResult = {
  creditCardName: string
  statementPeriod: string
  actualAmount: number
  predictedAmount: number
  emiTotal: number
  nonEmiSpend: number
  refunds: number
  difference: number
  emiBreakdown: Array<{ name: string; amount: number }>
  transactionCount: { expenses: number; refunds: number }
}

type ExtractedStatement = {
  bank_name: string
  card_type: string
  card_number: string
  statement_date: string
  statement_period: string
  payment_due_date: string
  total_due: number
  minimum_due: number
  credit_limit: number
  available_limit: number
  transactions: Array<{
    date: string
    description: string
    amount: number
    transaction_type: 'debit' | 'credit'
    reference: string
  }>
}

type ImportResult = {
  imported: number
  skipped: number
  total: number
}

export default function StatementAnalysisPage() {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [extractedStatement, setExtractedStatement] = useState<ExtractedStatement | null>(null)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const [formData, setFormData] = useState({
    credit_card_id: '',
    start_date: '',
    end_date: '',
    actual_statement_amount: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserEmail(user.email || '')

      const { data: cards } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')
        .limit(1000)

      setCreditCards((cards || []) as CreditCard[])
    }
    loadData()
  }, [router, supabase])

  const handleAnalyze = async () => {
    if (!formData.credit_card_id || !formData.start_date || !formData.end_date || !formData.actual_statement_amount) {
      alert('Please fill all fields')
      return
    }

    setAnalyzing(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const selectedCard = creditCards.find(c => c.id === formData.credit_card_id)

    // Get EMIs linked to this card for the period
    const { data: emis } = await supabase
      .from('emis')
      .select('emi_name, monthly_emi, next_due_date')
      .eq('user_id', user.id)
      .eq('linked_card_id', formData.credit_card_id)
      .is('deleted_at', null)
      .gte('next_due_date', formData.start_date)
      .lte('next_due_date', formData.end_date)
      .limit(1000)

    const emiTotal = emis?.reduce((sum, emi) => sum + emi.monthly_emi, 0) || 0
    const emiBreakdown = emis?.map(emi => ({ name: emi.emi_name, amount: emi.monthly_emi })) || []

    // Get expense transactions for this card
    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .eq('credit_card_id', formData.credit_card_id)
      .is('deleted_at', null)
      .gte('date', formData.start_date)
      .lte('date', formData.end_date)
      .limit(1000)

    const nonEmiSpend = expenses?.reduce((sum, txn) => sum + txn.amount, 0) || 0
    const expenseCount = expenses?.length || 0

    // Get refunds/income for this card
    const { data: refunds } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'income')
      .eq('credit_card_id', formData.credit_card_id)
      .is('deleted_at', null)
      .gte('date', formData.start_date)
      .lte('date', formData.end_date)
      .limit(1000)

    const refundTotal = refunds?.reduce((sum, txn) => sum + txn.amount, 0) || 0
    const refundCount = refunds?.length || 0

    const predictedAmount = emiTotal + nonEmiSpend - refundTotal
    const actualAmount = parseFloat(formData.actual_statement_amount)
    const difference = actualAmount - predictedAmount

    setResult({
      creditCardName: selectedCard?.name || '',
      statementPeriod: `${new Date(formData.start_date).toLocaleDateString('en-IN')} - ${new Date(formData.end_date).toLocaleDateString('en-IN')}`,
      actualAmount,
      predictedAmount,
      emiTotal,
      nonEmiSpend,
      refunds: refundTotal,
      difference,
      emiBreakdown,
      transactionCount: { expenses: expenseCount, refunds: refundCount }
    })

    setAnalyzing(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setExtractedStatement(null)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/statements/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Upload failed: ${data.error || 'Unknown error'}`)
        return
      }

      setExtractedStatement(data.data)
    } catch (error: unknown) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleImportTransactions = async () => {
    if (!extractedStatement) return

    // Find matching credit card
    const matchingCard = creditCards.find(card =>
      (card.last_four_digits && extractedStatement.card_number.includes(card.last_four_digits)) ||
      (card.last_four_digits && extractedStatement.card_number.replace(/X/g, '').includes(card.last_four_digits))
    )

    if (!matchingCard) {
      alert('No matching credit card found. Please create a credit card with matching card number first.')
      return
    }

    setImporting(true)

    try {
      const response = await fetch('/api/statements/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementData: extractedStatement,
          creditCardId: matchingCard.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        alert(`Import failed: ${data.error || 'Unknown error'}`)
        return
      }

      setImportResult(data)
      setExtractedStatement(null)
    } catch (error: unknown) {
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <AppLayout userEmail={userEmail}>
      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">💳 Credit Card Statement Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">
              Upload PDF statements or compare actual amounts with predicted spending
            </p>
          </div>

          {/* PDF Upload Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Upload PDF Statement</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a credit card statement PDF to automatically extract and import transactions
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="pdf-upload"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Choose PDF File'}
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supports: HDFC, Standard Chartered, IndusInd, ICICI, YES Bank
              </p>
            </div>

            {/* Extracted Statement Preview */}
            {extractedStatement && (
              <div className="mt-6 border border-green-200 bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">✅ Statement Extracted Successfully</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Bank:</span>
                    <div className="font-medium">{extractedStatement.bank_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Card Type:</span>
                    <div className="font-medium">{extractedStatement.card_type || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Card Number:</span>
                    <div className="font-medium">{extractedStatement.card_number}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Due:</span>
                    <div className="font-medium">{formatCurrency(extractedStatement.total_due)}</div>
                  </div>
                </div>

                <div className="text-sm mb-4">
                  <span className="text-gray-600">Transactions Found:</span>
                  <span className="font-medium ml-2">{extractedStatement.transactions.length}</span>
                </div>

                <button
                  type="button"
                  onClick={handleImportTransactions}
                  disabled={importing}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {importing ? 'Importing...' : '📥 Import Transactions'}
                </button>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <div className="mt-4 border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">✅ Import Complete</h4>
                <div className="text-sm space-y-1">
                  <div>✓ Imported: {importResult.imported} transactions</div>
                  <div>⏭ Skipped: {importResult.skipped} duplicates</div>
                  <div>📊 Total: {importResult.total} transactions</div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Analysis Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Manual Statement Analysis</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="credit_card_id" className="block text-sm font-medium text-gray-700">Credit Card *</label>
                <select
                  id="credit_card_id"
                  value={formData.credit_card_id}
                  onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value })}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!formData.credit_card_id ? 'text-gray-500' : 'text-gray-900'}`}
                >
                  <option value="">Select credit card</option>
                  {creditCards.map((card) => (
                    <option key={card.id} value={card.id}>{card.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="actual_statement_amount" className="block text-sm font-medium text-gray-700">Actual Statement Amount *</label>
                <input
                  type="number"
                  id="actual_statement_amount"
                  min="0"
                  step="0.01"
                  value={formData.actual_statement_amount}
                  onChange={(e) => setFormData({ ...formData, actual_statement_amount: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter amount from statement"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Statement Start Date *</label>
                <input
                  type="date"
                  id="start_date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Statement End Date *</label>
                <input
                  type="date"
                  id="end_date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {analyzing ? 'Analyzing...' : '🔍 Analyze Statement'}
            </button>
          </div>

          {/* Analysis Result */}
          {result && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="text-sm font-medium text-gray-500 mb-2">📄 Actual Statement</div>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(result.actualAmount)}</div>
                  <div className="text-xs text-gray-500 mt-1">{result.creditCardName}</div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="text-sm font-medium text-gray-500 mb-2">🧮 Predicted Amount</div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(result.predictedAmount)}</div>
                  <div className="text-xs text-gray-500 mt-1">{result.statementPeriod}</div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="text-sm font-medium text-gray-500 mb-2">
                    {Math.abs(result.difference) < 10 ? '✅' : '⚠️'} Difference
                  </div>
                  <div className={`text-2xl font-bold ${
                    Math.abs(result.difference) < 10 ? 'text-green-600' :
                    result.difference > 0 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {result.difference > 0 ? '+' : ''}{formatCurrency(result.difference)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.abs(result.difference) < 10 ? 'Matched!' : result.difference > 0 ? 'Statement higher' : 'App higher'}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Calculation Breakdown</h3>

                <div className="space-y-4">
                  {/* EMI Section */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">📅 EMI Payments</span>
                        <span className="ml-2 text-xs text-gray-500">({result.emiBreakdown.length} EMIs)</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(result.emiTotal)}</span>
                    </div>
                    {result.emiBreakdown.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {result.emiBreakdown.map((emi, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">{emi.name}</span>
                            <span className="text-gray-700">{formatCurrency(emi.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Non-EMI Spend */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">💸 Non-EMI Spend</span>
                        <span className="ml-2 text-xs text-gray-500">({result.transactionCount.expenses} transactions)</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(result.nonEmiSpend)}</span>
                    </div>
                  </div>

                  {/* Refunds */}
                  <div className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">💵 Refunds/Credits</span>
                        <span className="ml-2 text-xs text-gray-500">({result.transactionCount.refunds} refunds)</span>
                      </div>
                      <span className="text-sm font-bold text-red-600">- {formatCurrency(result.refunds)}</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Predicted Total</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(result.predictedAmount)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Formula: EMI + Non-EMI Spend - Refunds
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {Math.abs(result.difference) >= 10 && (
                <div className={`rounded-lg p-4 ${
                  result.difference > 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                }`}>
                  <h3 className="text-sm font-semibold mb-2 ${
                    result.difference > 0 ? 'text-red-900' : 'text-orange-900'
                  }">
                    {result.difference > 0 ? '⚠️ Discrepancy Found' : '💡 Possible Missing Entries'}
                  </h3>
                  <ul className={`text-sm space-y-1 ${
                    result.difference > 0 ? 'text-red-800' : 'text-orange-800'
                  }`}>
                    {result.difference > 0 ? (
                      <>
                        <li>• Statement amount is {formatCurrency(Math.abs(result.difference))} higher than predicted</li>
                        <li>• Check for missing expense entries in the app</li>
                        <li>• Verify if all EMIs were captured correctly</li>
                        <li>• Look for any fees, charges, or interest not tracked</li>
                      </>
                    ) : (
                      <>
                        <li>• App amount is {formatCurrency(Math.abs(result.difference))} higher than statement</li>
                        <li>• Check for duplicate entries in the app</li>
                        <li>• Verify if refunds were correctly recorded</li>
                        <li>• Some transactions might be from previous/next cycle</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {Math.abs(result.difference) < 10 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <div>
                      <h3 className="text-sm font-semibold text-green-900">Perfect Match!</h3>
                      <p className="text-sm text-green-800">Your app data matches the statement within ₹10 margin.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  )
}
