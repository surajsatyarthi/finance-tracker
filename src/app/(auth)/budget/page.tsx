'use client'

import { useState, useEffect, useMemo } from 'react'
import { budgetProjections2025 } from '@/lib/budgetData'

// 13 months: Dec 2025 to Dec 2026
const monthColumns = [
  { month: 'December', year: 2025 },
  { month: 'January', year: 2026 },
  { month: 'February', year: 2026 },
  { month: 'March', year: 2026 },
  { month: 'April', year: 2026 },
  { month: 'May', year: 2026 },
  { month: 'June', year: 2026 },
  { month: 'July', year: 2026 },
  { month: 'August', year: 2026 },
  { month: 'September', year: 2026 },
  { month: 'October', year: 2026 },
  { month: 'November', year: 2026 },
  { month: 'December', year: 2026 },
]

export default function BudgetPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

  // Get 13-month values for each category (Dec 2025 + Jan-Dec 2026)
  // Using 2025 projections: index 11 (Dec) for Dec 2025, then indices 0-11 for 2026
  const get13MonthValues = (limits: number[]) => {
    return [
      limits[11], // Dec 2025
      limits[0],  // Jan 2026
      limits[1],  // Feb 2026
      limits[2],  // Mar 2026
      limits[3],  // Apr 2026
      limits[4],  // May 2026
      limits[5],  // Jun 2026
      limits[6],  // Jul 2026
      limits[7],  // Aug 2026
      limits[8],  // Sep 2026
      limits[9],  // Oct 2026
      limits[10], // Nov 2026
      limits[11], // Dec 2026
    ]
  }

  // Calculate totals for 13 months
  const { monthlyTotals, grandTotal, categoryTotals, categoryMonthlyValues } = useMemo(() => {
    const monthlyTotals = Array(13).fill(0)
    const categoryTotals: Record<string, number> = {}
    const categoryMonthlyValues: Record<string, number[]> = {}
    let grandTotal = 0

    budgetProjections2025.forEach(item => {
      const values = get13MonthValues(item.limits)
      categoryMonthlyValues[item.category] = values

      let total = 0
      values.forEach((val, idx) => {
        monthlyTotals[idx] += val
        total += val
        grandTotal += val
      })
      categoryTotals[item.category] = total
    })

    return { monthlyTotals, grandTotal, categoryTotals, categoryMonthlyValues }
  }, [])

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0'
    return amount.toLocaleString('en-IN')
  }

  // Parent categories (highlighted in yellow)
  const parentCategories = [
    'Loan', 'Transport', 'Data', 'Self Growth', 'Food', 'Grooming',
    'Health', 'Clothing', 'Insurance', 'Subscriptions', 'Credit Card Monthly',
    'Credit Card EMI', 'Shopping', 'Misc'
  ]

  const isParent = (cat: string) => parentCategories.includes(cat)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Budget Dec 2025 - Dec 2026</h1>
          <p className="text-gray-600">13-Month Budget Allocation</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm text-gray-900">
            {/* Header Row - Yellow Background */}
            <thead>
              <tr className="bg-yellow-300">
                <th className="sticky left-0 bg-yellow-300 z-20 px-4 py-3 text-left font-semibold border-r border-yellow-400 min-w-[180px] text-gray-900">
                  Category
                </th>
                {monthColumns.map((col, idx) => (
                  <th key={idx} className="px-3 py-3 text-right font-semibold border-r border-yellow-400 min-w-[95px] whitespace-nowrap text-gray-900">
                    {col.month.slice(0, 3)} {col.year}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold bg-red-600 text-white min-w-[100px]">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-900">
              {budgetProjections2025.map((item, rowIdx) => {
                const isParentRow = isParent(item.category)
                const rowTotal = categoryTotals[item.category]
                const monthlyValues = categoryMonthlyValues[item.category] || []

                return (
                  <tr
                    key={item.category}
                    className={`
                      ${isParentRow ? 'bg-yellow-200 font-semibold' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      hover:bg-gray-100 transition-colors border-b border-gray-200
                    `}
                  >
                    <td className={`sticky left-0 z-10 px-4 py-2 border-r border-gray-200 text-gray-900 ${isParentRow ? 'bg-yellow-200' : rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      {item.category}
                    </td>
                    {monthlyValues.map((limit, monthIdx) => (
                      <td key={monthIdx} className="px-3 py-2 text-right border-r border-gray-200 tabular-nums text-gray-900">
                        {formatCurrency(limit)}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-right font-semibold bg-red-100 text-red-800 tabular-nums">
                      {formatCurrency(rowTotal)}
                    </td>
                  </tr>
                )
              })}

              {/* Total Row */}
              <tr className="bg-yellow-300 font-bold border-t-2 border-yellow-500">
                <td className="sticky left-0 bg-yellow-300 z-10 px-4 py-3 border-r border-yellow-400 text-gray-900">
                  TOTAL
                </td>
                {monthlyTotals.map((total, idx) => (
                  <td key={idx} className="px-3 py-3 text-right border-r border-yellow-400 tabular-nums text-gray-900">
                    {formatCurrency(total)}
                  </td>
                ))}
                <td className="px-4 py-3 text-right bg-red-600 text-white tabular-nums">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">13-Month Budget</p>
            <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(grandTotal)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Monthly Average</p>
            <p className="text-2xl font-bold text-blue-600">₹{formatCurrency(Math.round(grandTotal / 13))}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-green-600">{budgetProjections2025.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
