'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeftIcon,
    BanknotesIcon,
    ChartBarIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ClockIcon,
    CalculatorIcon
} from '@heroicons/react/24/outline'
import {
    generateAmortizationSchedule,
    calculatePrepaymentImpact,
    getLoanOutstandingBalance,
    getLoanTotalInterestPaid,
    getLoanTotalPrincipalPaid,
    type AmortizationEntry,
    type PrepaymentAnalysis
} from '@/lib/financialUtils'
import { FinanceDataManager } from '@/lib/supabaseDataManager'
import { Loan, LoanPayment } from '@/types/finance'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function LoanDetailPage() {
    const params = useParams()
    const router = useRouter()
    const loanId = params.id as string

    // Use shared 'Loan' type instead of legacy 'LoanRecord'
    const [loan, setLoan] = useState<Loan | null>(null)
    const [payments, setPayments] = useState<LoanPayment[]>([])
    const [schedule, setSchedule] = useState<AmortizationEntry[]>([])
    const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'payments' | 'calculator'>('overview')
    const [prepaymentAmount, setPrepaymentAmount] = useState<string>('')
    const [prepaymentAnalysis, setPrepaymentAnalysis] = useState<PrepaymentAnalysis | null>(null)

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], type: 'emi_payment', notes: '' })
    const [isSavingPayment, setIsSavingPayment] = useState(false)

    const financeManager = FinanceDataManager.getInstance()

    useEffect(() => {
        const loadData = async () => {
            await financeManager.initialize()
            // We need getLoan (single) or find from list. 
            // FinanceDataManager just has getLoans(). optimize later if needed.
            // Wait, financeManager internal getLoans uses supabase? Yes.
            const loans = await financeManager.getLoans() || []
            // Need to cast or unsure if types match perfectly?
            // Supabase types from `tables` vs Shared `Loan`.
            // financeManager.getLoans() returns Database Row type. 
            // We might need to map it to 'Loan' shared type if they differ significantly.
            // Shared 'Loan' expects camelCase or snake_case? 
            // src/types/finance.ts defines snake_case: user_id, principal_amount, etc.
            // DB types are snake_case. So casting should work.
            const foundLoan = (loans as unknown as Loan[]).find(l => l.id === loanId)

            if (!foundLoan) {
                router.push('/loans')
                return
            }

            setLoan(foundLoan)

            // Fetch payments
            const fetchedPayments = await financeManager.getLoanPayments(loanId) || []
            setPayments(fetchedPayments as unknown as LoanPayment[])

            // Generate Schedule using Utility
            // Ensure 'fetchedPayments' matches 'LoanPayment' structure expected by utility
            setSchedule(generateAmortizationSchedule(foundLoan, fetchedPayments as unknown as LoanPayment[]))
        }
        loadData()
    }, [loanId, router])

    const stats = useMemo(() => {
        if (!loan) return null

        return {
            outstandingBalance: getLoanOutstandingBalance(loan, payments),
            totalInterestPaid: getLoanTotalInterestPaid(loan, payments),
            totalPrincipalPaid: getLoanTotalPrincipalPaid(loan, payments),
            progress: (loan.emis_paid / loan.total_emis) * 100,
            remainingEmis: loan.total_emis - loan.emis_paid
        }
    }, [loan, payments])

    const chartData = useMemo(() => {
        if (!loan || !stats) return { pieData: [], lineData: [] }

        // Note: loan.totalAmount doesn't exist on DB row usually, it's calculated.
        // Utility 'calculateEMI' gives totalAmount. 
        // Or we assume 'emi_amount * total_emis'.
        const totalAmount = loan.emi_amount * loan.total_emis
        const totalInterest = totalAmount - loan.principal_amount

        const pieData = [
            { name: 'Principal Paid', value: stats.totalPrincipalPaid, color: '#10b981' },
            { name: 'Interest Paid', value: stats.totalInterestPaid, color: '#f59e0b' },
            { name: 'Outstanding', value: stats.outstandingBalance, color: '#6366f1' }
        ]

        const lineData = schedule.map(entry => ({
            month: entry.month,
            outstanding: entry.outstandingBalance,
            principal: entry.principalComponent,
            interest: entry.interestComponent
        }))

        return { pieData, lineData }
    }, [loan, stats, schedule])

    const handlePrepaymentCalculation = () => {
        const amount = parseFloat(prepaymentAmount)
        if (isNaN(amount) || amount <= 0 || !loan) return

        const analysis = calculatePrepaymentImpact(loan, payments, amount)
        setPrepaymentAnalysis(analysis)
    }

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!loan) return

        try {
            setIsSavingPayment(true)
            await financeManager.updateLoanWithPayment(loan.id, {
                amount: parseFloat(paymentForm.amount),
                date: paymentForm.date,
                type: paymentForm.type,
                notes: paymentForm.notes
            })

            // Refresh data
            const loans = await financeManager.getLoans()
            const foundLoan = loans.find(l => l.id === loanId)
            if (foundLoan) setLoan(foundLoan)

            const fetchedPayments = await financeManager.getLoanPayments(loanId) || []
            setPayments(fetchedPayments as unknown as LoanPayment[])

            if (foundLoan) {
                setSchedule(generateAmortizationSchedule(foundLoan, fetchedPayments as unknown as LoanPayment[]))
            }

            setIsPaymentModalOpen(false)
            setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0], type: 'emi_payment', notes: '' })
            alert('Payment recorded successfully')
        } catch (error) {
            console.error('Failed to record payment:', error)
            alert('Failed to record payment')
        } finally {
            setIsSavingPayment(false)
        }
    }

    if (!loan || !stats) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    // Helpers
    // loan.monthlyAmount -> loan.emi_amount
    // loan.principal -> loan.principal_amount
    // loan.rate -> loan.interest_rate
    // loan.tenureMonths -> loan.total_emis
    // loan.startDate -> loan.start_date
    // loan.nextDueDate -> loan.next_emi_date
    // loan.totalAmount -> (calculated)
    const totalAmount = (loan.emi_amount ?? 0) * (loan.total_emis ?? 1)

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    const formatDate = (date: string) => {
        if (!date) return 'N/A'
        const d = new Date(date)
        const day = d.getDate().toString().padStart(2, '0')
        const month = (d.getMonth() + 1).toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={() => router.push('/loans')}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Loans
                        </button>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <BanknotesIcon className="-ml-1 mr-2 h-5 w-5" />
                            Record Payment
                        </button>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center mb-2">
                                    <BanknotesIcon className="h-8 w-8 mr-3" />
                                    <h1 className="text-3xl font-bold">{loan.name}</h1>
                                </div>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-blue-200">Principal</span>
                                        <p className="font-semibold text-lg">{formatCurrency(loan.principal_amount)}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-200">Interest Rate</span>
                                        <p className="font-semibold text-lg">{loan.interest_rate ? `${loan.interest_rate}% p.a.` : '0% (N/A)'}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-200">Tenure</span>
                                        <p className="font-semibold text-lg">{loan.total_emis ? `${loan.total_emis} months` : 'Flexible'}</p>
                                    </div>
                                    <div>
                                        <span className="text-blue-200">Monthly EMI</span>
                                        <p className="font-semibold text-lg">{loan.emi_amount ? formatCurrency(loan.emi_amount) : 'Flexible'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-blue-200 text-sm mb-1">Outstanding Balance</p>
                                <p className="text-4xl font-bold">{formatCurrency(stats.outstandingBalance)}</p>
                                <p className="text-blue-200 text-sm mt-2">
                                    Next Due: {formatDate(loan.next_emi_date || '')}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span>Progress: {loan.emis_paid} / {loan.total_emis} EMIs paid</span>
                                <span>{Math.round(stats.progress)}%</span>
                            </div>
                            <div className="w-full bg-blue-900/30 rounded-full h-3">
                                <div
                                    className="bg-white rounded-full h-3 transition-all duration-300"
                                    style={{ width: `${stats.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Principal Paid</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalPrincipalPaid)}</p>
                            </div>
                            <CheckCircleIcon className="h-10 w-10 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Interest Paid</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(stats.totalInterestPaid)}</p>
                            </div>
                            <BanknotesIcon className="h-10 w-10 text-orange-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Remaining EMIs</p>
                                <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.remainingEmis}</p>
                            </div>
                            <ClockIcon className="h-10 w-10 text-indigo-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Payable</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
                            </div>
                            <DocumentTextIcon className="h-10 w-10 text-gray-500" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            {[
                                { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                                { id: 'schedule', label: `Amortization (${schedule.length})`, icon: DocumentTextIcon },
                                { id: 'payments', label: `Payments (${payments.length})`, icon: BanknotesIcon },
                                { id: 'calculator', label: 'Prepayment Calculator', icon: CalculatorIcon }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'overview' | 'schedule' | 'payments' | 'calculator')}
                                    className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Pie Chart */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={chartData.pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`} // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {chartData.pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Loan Details */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Start Date</span>
                                                <span className="font-medium text-gray-900">{formatDate(loan.startDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Next Due Date</span>
                                                <span className="font-medium text-gray-900">{formatDate(loan.nextDueDate)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">EMIs Paid</span>
                                                <span className="font-medium text-gray-900">{loan.emisPaid} / {loan.tenureMonths}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Interest</span>
                                                <span className="font-medium text-gray-900">{formatCurrency(loan.totalAmount - loan.principal)}</span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t">
                                                <span className="text-gray-600 font-semibold">Outstanding</span>
                                                <span className="font-bold text-indigo-600">{formatCurrency(stats.outstandingBalance)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Line Chart */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Balance Over Time</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData.lineData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                                            <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                            <Legend />
                                            <Line type="monotone" dataKey="outstanding" stroke="#6366f1" name="Outstanding Balance" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Amortization Schedule Tab */}
                        {activeTab === 'schedule' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amortization Schedule</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">EMI</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {schedule.map(entry => (
                                                <tr
                                                    key={entry.month}
                                                    className={`${entry.isPaid ? 'bg-green-50' : ''} ${entry.month === loan.emisPaid + 1 ? 'bg-blue-50 font-semibold' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-900">{entry.month}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(entry.emiAmount)}</td>
                                                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(entry.principalComponent)}</td>
                                                    <td className="px-4 py-3 text-sm text-orange-600">{formatCurrency(entry.interestComponent)}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(entry.outstandingBalance)}</td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {entry.isPaid ? (
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                                                Paid
                                                            </span>
                                                        ) : entry.month === loan.emisPaid + 1 ? (
                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                                <ClockIcon className="h-3 w-3 mr-1" />
                                                                Due Next
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                                {payments.length === 0 ? (
                                    <p className="text-gray-500 text-center py-12">No payments recorded yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {payments.map(payment => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(payment.paymentDate)} • {payment.paymentType.replace('_', ' ')}
                                                    </p>
                                                    {payment.notes && (
                                                        <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                                                    )}
                                                </div>
                                                <div className="text-right text-sm">
                                                    <p className="text-green-600">Principal: {formatCurrency(payment.principalPaid)}</p>
                                                    <p className="text-orange-600">Interest: {formatCurrency(payment.interestPaid)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Prepayment Calculator Tab */}
                        {activeTab === 'calculator' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prepayment Impact Calculator</h3>
                                <div className="max-w-2xl">
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prepayment Amount
                                        </label>
                                        <div className="flex gap-3">
                                            <input
                                                type="number"
                                                value={prepaymentAmount}
                                                onChange={(e) => setPrepaymentAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={handlePrepaymentCalculation}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                            >
                                                Calculate
                                            </button>
                                        </div>
                                    </div>

                                    {prepaymentAnalysis && (
                                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                                            <h4 className="font-semibold text-gray-900 mb-4">Impact Analysis</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-600">Tenure Reduction</p>
                                                    <p className="text-xl font-bold text-indigo-600">{prepaymentAnalysis.tenureReduction} months</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Interest Saved</p>
                                                    <p className="text-xl font-bold text-green-600">{formatCurrency(prepaymentAnalysis.interestSaved)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">New Tenure</p>
                                                    <p className="text-lg font-semibold text-gray-900">{prepaymentAnalysis.newTenure} months</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">New Completion Date</p>
                                                    <p className="text-lg font-semibold text-gray-900">{formatDate(prepaymentAnalysis.newCompletionDate)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-indigo-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Monthly EMI (unchanged)</span>
                                                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(prepaymentAnalysis.newMonthlyEmi)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {
                isPaymentModalOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Payment</h3>
                            <form onSubmit={handleRecordPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={paymentForm.amount}
                                        onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={paymentForm.date}
                                        onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={paymentForm.type}
                                        onChange={e => setPaymentForm({ ...paymentForm, type: e.target.value })}
                                    >
                                        <option value="emi_payment">Regular EMI</option>
                                        <option value="prepayment">Prepayment (Principal Only)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        value={paymentForm.notes}
                                        onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                                    />
                                </div>
                                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                    <button
                                        type="submit"
                                        disabled={isSavingPayment}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:col-start-2 sm:text-sm disabled:opacity-50"
                                    >
                                        {isSavingPayment ? 'Saving...' : 'Save Payment'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
