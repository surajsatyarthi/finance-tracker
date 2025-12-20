'use client'

import { useState, useEffect, useMemo } from 'react'
import { FinanceDataManager } from '@/lib/supabaseDataManager'

// 13 months: Dec 2025 to Dec 2026
const monthColumns = [
    { month: 'Dec', year: 2025, monthNum: 12 },
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

interface MonthlyData {
    [category: string]: number[]
}

export default function SummaryPage() {
    const [loading, setLoading] = useState(true)
    const [incomeData, setIncomeData] = useState<MonthlyData>({})
    const [expenseData, setExpenseData] = useState<MonthlyData>({})

    const financeManager = FinanceDataManager.getInstance()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            await financeManager.initialize()

            // Fetch all categories from database
            const allCategories = await financeManager.getCategories()

            // Separate income and expense categories
            const incomeCategories = allCategories.filter((c: any) => c.type === 'income').map((c: any) => c.name)
            const expenseCategories = allCategories.filter((c: any) => c.type === 'expense').map((c: any) => c.name)

            // Initialize all categories with zeros
            const incomeByCategory: MonthlyData = {}
            const expenseByCategory: MonthlyData = {}

            incomeCategories.forEach((cat: string) => {
                incomeByCategory[cat] = Array(13).fill(0)
            })

            expenseCategories.forEach((cat: string) => {
                expenseByCategory[cat] = Array(13).fill(0)
            })

            // Fetch all transactions
            const incomeTransactions = await financeManager.getIncomeTransactions()
            const expenseTransactions = await financeManager.getExpenseTransactions()

            // Process income - add to existing category buckets
            incomeTransactions.forEach((t: any) => {
                const date = new Date(t.date)
                const category = t.subcategory || 'Other Income'

                if (!incomeByCategory[category]) {
                    incomeByCategory[category] = Array(13).fill(0)
                }

                const monthIdx = getMonthIndex(date)
                if (monthIdx !== -1) {
                    incomeByCategory[category][monthIdx] += t.amount
                }
            })

            // Process expenses - add to existing category buckets
            expenseTransactions.forEach((t: any) => {
                const date = new Date(t.date)
                const category = t.subcategory || 'Other Expense'

                if (!expenseByCategory[category]) {
                    expenseByCategory[category] = Array(13).fill(0)
                }

                const monthIdx = getMonthIndex(date)
                if (monthIdx !== -1) {
                    expenseByCategory[category][monthIdx] += t.amount
                }
            })

            setIncomeData(incomeByCategory)
            setExpenseData(expenseByCategory)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get index (0-12) for a date in our Dec 2025 - Dec 2026 range
    const getMonthIndex = (date: Date): number => {
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // 1-12

        if (year === 2025 && month === 12) return 0
        if (year === 2026 && month >= 1 && month <= 12) return month
        return -1 // Outside our range
    }

    const formatCurrency = (amount: number) => {
        if (amount === 0) return '0'
        return amount.toLocaleString('en-IN')
    }

    // Calculate totals
    const calculateTotals = (data: MonthlyData) => {
        const monthlyTotals = Array(13).fill(0)
        const categoryTotals: Record<string, number> = {}
        let grandTotal = 0

        Object.entries(data).forEach(([category, values]) => {
            let catTotal = 0
            values.forEach((val, idx) => {
                monthlyTotals[idx] += val
                catTotal += val
                grandTotal += val
            })
            categoryTotals[category] = catTotal
        })

        return { monthlyTotals, categoryTotals, grandTotal }
    }

    const incomeTotals = useMemo(() => calculateTotals(incomeData), [incomeData])
    const expenseTotals = useMemo(() => calculateTotals(expenseData), [expenseData])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    const renderTable = (
        title: string,
        data: MonthlyData,
        totals: { monthlyTotals: number[], categoryTotals: Record<string, number>, grandTotal: number },
        headerColor: string,
        totalColor: string
    ) => {
        const categories = Object.keys(data).sort()
        const hasData = categories.length > 0

        return (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm text-gray-900">
                        <thead>
                            <tr className={headerColor}>
                                <th className={`sticky left-0 ${headerColor} z-20 px-4 py-3 text-left font-semibold border-r min-w-[180px] text-gray-900`}>
                                    Category
                                </th>
                                {monthColumns.map((col, idx) => (
                                    <th key={idx} className="px-3 py-3 text-right font-semibold border-r min-w-[85px] whitespace-nowrap text-gray-900">
                                        {col.month} {col.year}
                                    </th>
                                ))}
                                <th className={`px-4 py-3 text-right font-semibold ${totalColor} text-white min-w-[100px]`}>
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-900">
                            {!hasData ? (
                                <tr>
                                    <td colSpan={15} className="px-4 py-8 text-center text-gray-500">
                                        No data yet. Add transactions via income/expense forms.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {categories.map((category, rowIdx) => (
                                        <tr
                                            key={category}
                                            className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 hover:bg-gray-100`}
                                        >
                                            <td className={`sticky left-0 z-10 px-4 py-2 border-r text-gray-900 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                {category}
                                            </td>
                                            {data[category].map((val, monthIdx) => (
                                                <td key={monthIdx} className="px-3 py-2 text-right border-r tabular-nums text-gray-900">
                                                    {formatCurrency(val)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-2 text-right font-semibold bg-gray-100 tabular-nums">
                                                {formatCurrency(totals.categoryTotals[category])}
                                            </td>
                                        </tr>
                                    ))}

                                    {/* Totals Row */}
                                    <tr className={`${headerColor} font-bold border-t-2`}>
                                        <td className={`sticky left-0 ${headerColor} z-10 px-4 py-3 border-r text-gray-900`}>
                                            TOTAL
                                        </td>
                                        {totals.monthlyTotals.map((total, idx) => (
                                            <td key={idx} className="px-3 py-3 text-right border-r tabular-nums text-gray-900">
                                                {formatCurrency(total)}
                                            </td>
                                        ))}
                                        <td className={`px-4 py-3 text-right ${totalColor} text-white tabular-nums`}>
                                            {formatCurrency(totals.grandTotal)}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-full mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>
                    <p className="text-gray-600">Dec 2025 - Dec 2026 (13 Months)</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Total Income</p>
                        <p className="text-2xl font-bold text-green-600">₹{formatCurrency(incomeTotals.grandTotal)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Total Expenses</p>
                        <p className="text-2xl font-bold text-red-600">₹{formatCurrency(expenseTotals.grandTotal)}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Net Savings</p>
                        <p className={`text-2xl font-bold ${incomeTotals.grandTotal - expenseTotals.grandTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{formatCurrency(incomeTotals.grandTotal - expenseTotals.grandTotal)}
                        </p>
                    </div>
                </div>

                {/* Income Table */}
                {renderTable(
                    'Income Summary',
                    incomeData,
                    incomeTotals,
                    'bg-green-200',
                    'bg-green-600'
                )}

                {/* Expense Table */}
                {renderTable(
                    'Expense Summary',
                    expenseData,
                    expenseTotals,
                    'bg-red-200',
                    'bg-red-600'
                )}
            </div>
        </div>
    )
}
