'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { parentCategories as PARENT_CATEGORIES, getColorForParent, findParentCategory } from '@/lib/categoryColors'
import CategoryLegend from '@/components/CategoryLegend'

// 12 months: Jan 2026 to Dec 2026
const monthColumns = [
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

interface BudgetRecord {
  id: string
  category_name: string
  monthly_limit: number
  year: number
  month: number
}

interface CategoryData {
  category: string
  limits: number[] // 12 months (Jan-Dec)
}

export default function BudgetPage() {
  const [loading, setLoading] = useState(true)
  const [budgetData, setBudgetData] = useState<CategoryData[]>([])

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        // Fetch all budget records
        const { data: budgets, error } = await supabase
          .from('budgets')
          .select('*')
          .order('category_name')
        
        if (error) throw error
        
        // Group by category and organize by month
        const categoryMap = new Map<string, number[]>()
        
        budgets?.forEach((record: BudgetRecord) => {
          if (!categoryMap.has(record.category_name)) {
            // Initialize with 12 months (Jan-Dec 2026), all zeros
            categoryMap.set(record.category_name, Array(12).fill(0))
          }
          
          const limits = categoryMap.get(record.category_name)!
          
          // Map month (1-12) to array index (0-11)
          // month 1 = January = index 0
          // month 12 = December = index 11
          const monthIndex = record.month - 1
          if (monthIndex >= 0 && monthIndex < 12) {
            limits[monthIndex] = record.monthly_limit
          }
        })
        
        // Convert to array format
        const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([category, limits]) => ({
          category,
          limits
        }))
        
        setBudgetData(categoryData)
      } catch (error) {
        console.error('Error fetching budget data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBudgetData()
  }, [])

  // Calculate totals for 12 months
  const { monthlyTotals, grandTotal, categoryTotals, categoryMonthlyValues } = useMemo(() => {
    const monthlyTotals = Array(12).fill(0)
    const categoryTotals: Record<string, number> = {}
    const categoryMonthlyValues: Record<string, number[]> = {}
    let grandTotal = 0

    budgetData.forEach(item => {
      categoryMonthlyValues[item.category] = item.limits

      let total = 0
      item.limits.forEach((val, idx) => {
        monthlyTotals[idx] += val
        total += val
        grandTotal += val
      })
      categoryTotals[item.category] = total
    })

    return { monthlyTotals, grandTotal, categoryTotals, categoryMonthlyValues }
  }, [budgetData])

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0'
    return amount.toLocaleString('en-IN')
  }

  const parentCategories = PARENT_CATEGORIES

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
          <h1 className="text-2xl font-bold text-gray-900">Budget (Jan 2026 - Dec 2026)</h1>
          <p className="text-gray-600">12-Month Budget Allocation</p>
          <CategoryLegend />
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
              {/** Group categories into parents + subcategories **/}
              {
                // Build grouped structure where parent (from parentCategories) collects matching children
                (() => {
                  const groups: Array<{ parent: string; children: CategoryData[] }> = []
                  const remaining = new Map(budgetData.map(d => [d.category, d]))

                  // Collect children for known parent categories
                  parentCategories.forEach(parent => {
                    const children = budgetData.filter(item => {
                      const cat = item.category
                      return cat === parent || cat.startsWith(parent) || cat.includes(`${parent} -`) || cat.includes(`${parent}:`) || cat.includes(`${parent} `)
                    })

                    if (children.length) {
                      children.forEach(c => remaining.delete(c.category))
                      groups.push({ parent, children })
                    }
                  })

                  // Add any remaining categories as individual groups
                  Array.from(remaining.values()).forEach(item => {
                    groups.push({ parent: item.category, children: [item] })
                  })

                  return groups.map((g, gIdx) => {
                    // compute monthly sums for group
                    const groupMonthly = Array(12).fill(0)
                    g.children.forEach(ch => ch.limits.forEach((v, i) => groupMonthly[i] += v))
                    const groupTotal = groupMonthly.reduce((s, v) => s + v, 0)

                    const showAsParentHeader = g.children.length > 1 || parentCategories.includes(g.parent)
                    const color = getColorForParent(g.parent)

                    return (
                      <tbody key={`group-${gIdx}`}>
                        {showAsParentHeader && (
                          <tr className={`${color.headerBg} font-semibold border-b ${color.headerBorder}`}>
                            <td className={`sticky left-0 z-10 px-4 py-2 border-r ${color.headerBorder} ${color.headerText}`}> {g.parent} </td>
                            {groupMonthly.map((m, mi) => (
                              <td key={mi} className={`px-3 py-2 text-right border-r ${color.headerBorder} tabular-nums ${color.headerText}`}>{formatCurrency(m)}</td>
                            ))}
                            <td className={`px-4 py-2 text-right font-semibold bg-red-100 text-red-800 tabular-nums`}>{formatCurrency(groupTotal)}</td>
                          </tr>
                        )}

                        {g.children.map((item, rowIdx) => {
                          const monthlyValues = item.limits || []
                          const rowTotal = (monthlyValues || []).reduce((s, v) => s + v, 0)
                          const isParentRow = parentCategories.includes(item.category) && g.children.length === 1

                          return (
                            <tr key={item.category} className={`bg-white hover:bg-gray-50 transition-colors border-b ${color.rowBorder}`}>
                              <td className={`sticky left-0 z-10 px-4 py-2 border-r ${color.rowBorder} text-gray-900`}>
                                <div className="flex items-center">
                                  {/* colored dot indicating category */}
                                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${color.dot}`}></span>
                                  {!showAsParentHeader ? (
                                    <span>{item.category}</span>
                                  ) : (
                                    <div className="pl-2 text-sm">{item.category.replace(`${g.parent}`, '').replace(/^[-:\s]+/, '') || item.category}</div>
                                  )}
                                </div>
                              </td>
                              {monthlyValues.map((limit, monthIdx) => (
                                <td key={monthIdx} className={`px-3 py-2 text-right border-r ${color.rowBorder} tabular-nums text-gray-900`}>
                                  {formatCurrency(limit)}
                                </td>
                              ))}
                              <td className="px-4 py-2 text-right font-semibold bg-red-100 text-red-800 tabular-nums">{formatCurrency(rowTotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    )
                  })
                })()
              }

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
            <p className="text-sm text-gray-500">12-Month Budget</p>
            <p className="text-2xl font-bold text-gray-900">₹{formatCurrency(grandTotal)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Monthly Average</p>
            <p className="text-2xl font-bold text-blue-600">₹{formatCurrency(Math.round(grandTotal / 12))}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-green-600">{budgetData.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
