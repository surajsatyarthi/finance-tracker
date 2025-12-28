export const parentCategories = [
  'Loan', 'Transport', 'Data', 'Self Growth', 'Food', 'Grooming',
  'Health', 'Clothing', 'Insurance', 'Subscriptions', 'Credit Card Monthly',
  'Credit Card EMI', 'Shopping', 'Misc'
]

export const categoryColorMap: Record<string, { headerBg: string; headerBorder: string; headerText: string; dot: string; rowBorder: string }> = {
  Loan: { headerBg: 'bg-amber-300', headerBorder: 'border-amber-400', headerText: 'text-amber-900', dot: 'bg-amber-600', rowBorder: 'border-amber-300' },
  Transport: { headerBg: 'bg-sky-300', headerBorder: 'border-sky-400', headerText: 'text-sky-900', dot: 'bg-sky-600', rowBorder: 'border-sky-300' },
  Data: { headerBg: 'bg-violet-300', headerBorder: 'border-violet-400', headerText: 'text-violet-900', dot: 'bg-violet-600', rowBorder: 'border-violet-300' },
  'Self Growth': { headerBg: 'bg-emerald-300', headerBorder: 'border-emerald-400', headerText: 'text-emerald-900', dot: 'bg-emerald-600', rowBorder: 'border-emerald-300' },
  Food: { headerBg: 'bg-rose-300', headerBorder: 'border-rose-400', headerText: 'text-rose-900', dot: 'bg-rose-600', rowBorder: 'border-rose-300' },
  Grooming: { headerBg: 'bg-pink-300', headerBorder: 'border-pink-400', headerText: 'text-pink-900', dot: 'bg-pink-600', rowBorder: 'border-pink-300' },
  Health: { headerBg: 'bg-lime-300', headerBorder: 'border-lime-400', headerText: 'text-lime-900', dot: 'bg-lime-600', rowBorder: 'border-lime-300' },
  Clothing: { headerBg: 'bg-indigo-300', headerBorder: 'border-indigo-400', headerText: 'text-indigo-900', dot: 'bg-indigo-600', rowBorder: 'border-indigo-300' },
  Insurance: { headerBg: 'bg-rose-200', headerBorder: 'border-rose-300', headerText: 'text-rose-900', dot: 'bg-rose-500', rowBorder: 'border-rose-200' },
  Subscriptions: { headerBg: 'bg-slate-200', headerBorder: 'border-slate-300', headerText: 'text-gray-900', dot: 'bg-gray-600', rowBorder: 'border-slate-200' },
  'Credit Card Monthly': { headerBg: 'bg-yellow-300', headerBorder: 'border-yellow-400', headerText: 'text-yellow-900', dot: 'bg-yellow-600', rowBorder: 'border-yellow-300' },
  'Credit Card EMI': { headerBg: 'bg-amber-200', headerBorder: 'border-amber-300', headerText: 'text-amber-900', dot: 'bg-amber-500', rowBorder: 'border-amber-200' },
  Shopping: { headerBg: 'bg-fuchsia-300', headerBorder: 'border-fuchsia-400', headerText: 'text-fuchsia-900', dot: 'bg-fuchsia-600', rowBorder: 'border-fuchsia-300' },
  Misc: { headerBg: 'bg-stone-300', headerBorder: 'border-stone-400', headerText: 'text-stone-900', dot: 'bg-stone-600', rowBorder: 'border-stone-300' },
}

export function findParentCategory(name?: string | null) {
  if (!name) return null
  const n = name.trim()
  for (const parent of parentCategories) {
    if (n === parent) return parent
    const lower = n.toLowerCase()
    const p = parent.toLowerCase()
    if (lower.startsWith(p) || lower.includes(`${p} -`) || lower.includes(`${p}:`) || lower.includes(`${p} `)) return parent
  }
  return null
}

export function getColorForParent(parent?: string | null) {
  if (!parent) return { headerBg: 'bg-white', headerBorder: 'border-gray-200', headerText: 'text-gray-900', dot: 'bg-gray-400', rowBorder: 'border-gray-200' }
  return categoryColorMap[parent] ?? { headerBg: 'bg-white', headerBorder: 'border-gray-200', headerText: 'text-gray-900', dot: 'bg-gray-400', rowBorder: 'border-gray-200' }
}
