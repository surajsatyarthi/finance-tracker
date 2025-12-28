import React from 'react'
import { parentCategories, categoryColorMap } from '@/lib/categoryColors'

export default function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {parentCategories.map((p) => {
        const c = categoryColorMap[p] || { dot: 'bg-gray-400', headerText: 'text-gray-900' }
        return (
          <div key={p} className="flex items-center space-x-2 text-sm">
            <span className={`inline-block w-4 h-4 rounded-sm ${c.dot} border ${c.headerBorder || 'border-gray-200'}`}></span>
            <span className="text-gray-700">{p}</span>
          </div>
        )
      })}
    </div>
  )
}
