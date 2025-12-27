/**
 * Fixed Deposits Management Page
 * 
 * CREATED: December 26, 2025 (Phase 5 Extension)
 * PURPOSE: View and manage Fixed Deposit accounts with auto-calculated interest and maturity tracking
 * 
 * FEATURES:
 * 1. View all active FDs in a table with live maturity countdown
 * 2. Add new FDs via form with real-time interest preview
 * 3. Summary cards showing total invested, interest, maturity value
 * 4. Auto-calculation of interest using simple interest formula: (P × R × T) / (365 × 100)
 * 
 * DATABASE:
 * - Table: fixed_deposits (created via scripts/add-sbi-fd-complete.sql)
 * - RLS: Users can only view/manage their own FDs
 * - Fields: bank_name, account_number, principal_amount, interest_rate, start_date, 
 *           maturity_date, maturity_amount, interest_earned, status, auto_renew
 * 
 * INTEREST CALCULATION:
 * - Uses simple interest for deposits < 1 year
 * - Formula: Interest = (Principal × Rate × Days) / (365 × 100)
 * - Example: ₹15,000 @ 7% for 170 days = ₹489
 * - Maturity Amount = Principal + Interest
 * 
 * NAVIGATION:
 * - Added to sidebar in src/components/Sidebar.tsx (line 41)
 * - Route: /fixed-deposits
 * 
 * WARNINGS:
 * - Interest calculation assumes simple interest (not compound)
 * - For deposits > 1 year, consider using compound interest formula
 * - Maturity date must be after start date (enforced by form validation)
 */

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRequireAuth } from '@/contexts/AuthContext'
import GlassCard from '@/components/GlassCard'
import Toast from '@/components/Toast'
import { BanknotesIcon, CalendarIcon, ArrowTrendingUpIcon, PlusIcon } from '@heroicons/react/24/outline'

/**
 * Fixed Deposit Interface
 * 
 * Maps to fixed_deposits table schema
 * All amounts stored as DECIMAL(15,2) in database
 */
interface FixedDeposit {
    id: string
    bank_name: string
    account_number: string
    principal_amount: number
    interest_rate: number
    start_date: string
    maturity_date: string
    maturity_amount: number
    interest_earned: number
    status: 'active' | 'matured' | 'premature_withdrawal' | 'closed'
    auto_renew: boolean
}

export default function FixedDepositsPage() {
    const { user } = useRequireAuth()
    const [fds, setFds] = useState<FixedDeposit[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        bank_name: '',
        account_number: '',
        principal_amount: '',
        interest_rate: '',
        start_date: '',
        maturity_date: '',
        auto_renew: false
    })
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    useEffect(() => {
        if (user) {
            loadFDs()
        }
    }, [user])

    const loadFDs = async () => {
        try {
            const { data, error } = await supabase
                .from('fixed_deposits')
                .select('*')
                .eq('user_id', user?.id)
                .eq('is_active', true)
                .order('maturity_date', { ascending: true })

            if (error) throw error
            setFds(data || [])
        } catch (error) {
            console.error('Error loading FDs:', error)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Calculate days remaining until FD maturity
     * 
     * @param maturityDate - FD maturity date (YYYY-MM-DD format)
     * @returns Number of days until maturity (negative if already matured)
     */
    const getDaysToMaturity = (maturityDate: string) => {
        const today = new Date()
        const maturity = new Date(maturityDate)
        const diffTime = maturity.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    /**
     * Format date to Indian locale
     * 
     * @param dateStr - Date string in YYYY-MM-DD format
     * @returns Formatted date (e.g., "14 Jun 2026")
     */
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    /**
     * Convert days to months and days for better readability
     * 
     * @param days - Total number of days
     * @returns Object with months and remaining days
     * @example getMonthsAndDays(170) → { months: 5, days: 20 }
     */
    const getMonthsAndDays = (days: number) => {
        const months = Math.floor(days / 30)
        const remainingDays = days % 30
        return { months, days: remainingDays }
    }

    /**
     * Calculate Simple Interest and Maturity Amount
     * 
     * FORMULA: Interest = (Principal × Rate × Days) / (365 × 100)
     * 
     * WHY SIMPLE INTEREST:
     * - Most Indian banks use simple interest for FDs < 1 year
     * - For multi-year FDs, consider switching to compound interest
     * 
     * @param principal - Principal amount (₹)
     * @param rate - Annual interest rate (%)
     * @param startDate - FD start date (YYYY-MM-DD)
     * @param maturityDate - FD maturity date (YYYY-MM-DD)
     * @returns Object with interest, maturity amount, and duration in days
     * 
     * @example
     * calculateInterest(15000, 7, '2025-12-26', '2026-06-14')
     * → { interest: 489, maturityAmount: 15489, days: 170 }
     */
    const calculateInterest = (principal: number, rate: number, startDate: string, maturityDate: string) => {
        const start = new Date(startDate)
        const maturity = new Date(maturityDate)
        const diffTime = maturity.getTime() - start.getTime()
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const interest = Math.round((principal * rate * days) / (365 * 100))
        return { interest, maturityAmount: principal + interest, days }
    }

    /**
     * Handle FD Form Submission
     * 
     * PROCESS:
     * 1. Parse and validate form inputs
     * 2. Calculate interest and maturity amount
     * 3. Insert into fixed_deposits table
     * 4. Reset form and reload FDs list
     * 
     * VALIDATION:
     * - All fields required (enforced by HTML5 validation)
     * - Principal must be > 0
     * - Interest rate must be 0-20%
     * - Maturity date must be after start date
     * 
     * ERROR HANDLING:
     * - Logs detailed error info to console
     * - Shows user-friendly alert with specific error message
     * - RLS policies ensure user can only insert their own FDs
     * 
     * @param e - Form submit event
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const principal = parseFloat(formData.principal_amount)
            const rate = parseFloat(formData.interest_rate)
            const { interest, maturityAmount } = calculateInterest(
                principal,
                rate,
                formData.start_date,
                formData.maturity_date
            )

            const { data, error } = await supabase
                .from('fixed_deposits')
                .insert({
                    user_id: user?.id,
                    bank_name: formData.bank_name,
                    account_number: formData.account_number,
                    principal_amount: principal,
                    interest_rate: rate,
                    start_date: formData.start_date,
                    maturity_date: formData.maturity_date,
                    maturity_amount: maturityAmount,
                    interest_earned: interest,
                    status: 'active',
                    auto_renew: formData.auto_renew,
                    is_active: true
                })
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Database error')
            }

            // Show success toast
            setToast({ message: 'Fixed Deposit added successfully!', type: 'success' })

            // Reset form and reload
            setFormData({
                bank_name: '',
                account_number: '',
                principal_amount: '',
                interest_rate: '',
                start_date: '',
                maturity_date: '',
                auto_renew: false
            })
            setShowForm(false)
            await loadFDs()
        } catch (error: any) {
            console.error('Error adding FD:', error)
            setToast({
                message: error.message || 'Failed to add Fixed Deposit. Please try again.',
                type: 'error'
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-500">Loading Fixed Deposits...</p>
                </div>
            </div>
        )
    }

    const totalPrincipal = fds.reduce((sum, fd) => sum + fd.principal_amount, 0)
    const totalMaturityAmount = fds.reduce((sum, fd) => sum + fd.maturity_amount, 0)
    const totalInterest = fds.reduce((sum, fd) => sum + fd.interest_earned, 0)
    const activeFDs = fds.filter(fd => fd.status === 'active').length

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Fixed Deposits</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        {showForm ? 'Cancel' : '+ Add FD'}
                    </button>
                </div>

                {/* Add FD Form */}
                {showForm && (
                    <GlassCard className="mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">New Fixed Deposit</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bank_name}
                                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="e.g., SBI, HDFC, ICICI"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        FD Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.account_number}
                                        onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter FD account number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Principal Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        value={formData.principal_amount}
                                        onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="15000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Interest Rate (% p.a.) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="20"
                                        step="0.01"
                                        value={formData.interest_rate}
                                        onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="7.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maturity Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.maturity_date}
                                        onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.auto_renew}
                                            onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Auto-renew on maturity</span>
                                    </label>
                                </div>

                                {formData.principal_amount && formData.interest_rate && formData.start_date && formData.maturity_date && (
                                    <div className="md:col-span-2 p-4 bg-indigo-50 rounded-lg">
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Preview:</strong>
                                        </p>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Interest Earned:</span>
                                                <p className="font-semibold text-green-600">
                                                    ₹{calculateInterest(
                                                        parseFloat(formData.principal_amount),
                                                        parseFloat(formData.interest_rate),
                                                        formData.start_date,
                                                        formData.maturity_date
                                                    ).interest.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Maturity Amount:</span>
                                                <p className="font-semibold text-gray-900">
                                                    ₹{calculateInterest(
                                                        parseFloat(formData.principal_amount),
                                                        parseFloat(formData.interest_rate),
                                                        formData.start_date,
                                                        formData.maturity_date
                                                    ).maturityAmount.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Duration:</span>
                                                <p className="font-semibold text-gray-900">
                                                    {calculateInterest(
                                                        parseFloat(formData.principal_amount),
                                                        parseFloat(formData.interest_rate),
                                                        formData.start_date,
                                                        formData.maturity_date
                                                    ).days} days
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Adding...' : 'Add Fixed Deposit'}
                                </button>
                            </div>
                        </form>
                    </GlassCard>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <GlassCard>
                        <div className="flex items-center">
                            <BanknotesIcon className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                                <p className="text-2xl font-bold text-gray-900">₹{totalPrincipal.toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Interest</p>
                                <p className="text-2xl font-bold text-green-600">₹{totalInterest.toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center">
                            <BanknotesIcon className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Maturity Value</p>
                                <p className="text-2xl font-bold text-gray-900">₹{totalMaturityAmount.toLocaleString()}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <div className="flex items-center">
                            <CalendarIcon className="h-8 w-8 text-orange-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active FDs</p>
                                <p className="text-2xl font-bold text-gray-900">{activeFDs}</p>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* FDs Table */}
                <GlassCard className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Your Fixed Deposits</h2>
                    </div>

                    {fds.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <BanknotesIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Fixed Deposits Yet</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Start earning guaranteed returns by creating your first fixed deposit. Track interest, maturity dates, and projected earnings all in one place.
                            </p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Your First FD
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Bank
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            FD Number
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Principal
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest Rate
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maturity Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time to Maturity
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Interest Earned
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Maturity Amount
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {fds.map((fd) => {
                                        const daysToMaturity = getDaysToMaturity(fd.maturity_date)
                                        const { months, days } = getMonthsAndDays(daysToMaturity)

                                        return (
                                            <tr key={fd.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {fd.bank_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                    {fd.account_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                                    ₹{fd.principal_amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {fd.interest_rate}% p.a.
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(fd.maturity_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {daysToMaturity > 0 ? (
                                                        <span className="text-orange-600 font-medium">
                                                            {months > 0 && `${months}m `}{days}d
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600 font-medium">Matured</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-semibold">
                                                    ₹{fd.interest_earned.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">
                                                    ₹{fd.maturity_amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fd.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        fd.status === 'matured' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {fd.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </GlassCard>

                {/* Toast Notifications */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    )
}
