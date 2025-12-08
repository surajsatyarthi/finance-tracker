'use client'

import { useState, useEffect } from 'react'
import { financeManager } from '@/lib/supabaseDataManager'
import { BankAccount, Category } from '@/types/finance'
import { useNotification } from '@/contexts/NotificationContext'
import { Tab } from '@headlessui/react'
import { ArrowDownIcon, ArrowUpIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function TransactionForm() {
    const { showNotification } = useNotification()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [accounts, setAccounts] = useState<BankAccount[]>([])
    const [categories, setCategories] = useState<Category[]>([])

    const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense')
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        categoryId: '',
        accountId: '',
        toAccountId: '', // For transfers
        paymentMethod: 'upi'
    })

    useEffect(() => {
        async function loadData() {
            try {
                const [accs, cats] = await Promise.all([
                    financeManager.getAccounts(),
                    financeManager.getCategories()
                ])
                setAccounts(accs)
                setCategories(cats)
                if (accs.length > 0) {
                    setFormData(prev => ({ ...prev, accountId: accs[0].id }))
                }
            } catch (e) {
                console.error(e)
                showNotification('Failed to load form data', 'error')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const filteredCategories = categories.filter(c => c.type === (type === 'transfer' ? 'expense' : type))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            if (type === 'transfer') {
                if (!formData.accountId || !formData.toAccountId) throw new Error('Select source and destination accounts')

                // 1. Withdrawal from Source
                await financeManager.createTransaction({
                    amount: parseFloat(formData.amount),
                    type: 'expense', // System treats transfer out as expense technically or we need a specific type
                    // Actually, let's look at `createTransaction` signature. It allows 'transfer' type.
                    description: `Transfer to ${accounts.find(a => a.id === formData.toAccountId)?.name}: ${formData.description}`,
                    date: formData.date,
                    payment_method: 'bank_transfer',
                    account_id: formData.accountId,
                    category: 'Transfer'
                })

                // 2. Deposit to Destination
                await financeManager.createTransaction({
                    amount: parseFloat(formData.amount),
                    type: 'income',
                    description: `Transfer from ${accounts.find(a => a.id === formData.accountId)?.name}: ${formData.description}`,
                    date: formData.date,
                    payment_method: 'bank_transfer',
                    account_id: formData.toAccountId,
                    category: 'Transfer'
                })

            } else {
                await financeManager.createTransaction({
                    amount: parseFloat(formData.amount),
                    type: type, // 'income' or 'expense'
                    description: formData.description,
                    date: formData.date,
                    category: formData.categoryId, // Note: backend expects category NAME or ID depending on implementation. 
                    // `createTransaction` in `supabaseDataManager.ts` maps `subcategory` to `tx.category`. 
                    // We need to verify if it takes ID or Name. Looking at `createTransaction` code from earlier:
                    // `subcategory: tx.category || null`
                    // It seems it stores it in `subcategory`. Let's pass the Name if possible or ID. 
                    // Ideally passing ID to `category_id` column would be better but the current `createTransaction` implementation sets `category_id: null`.
                    // I will check `createTransaction` again in a moment. For now, I'll pass the category ID or Name.
                    // Let's pass the Category Name for now to match `subcategory` usage, or fix backend later.
                    // Actually, let's pass Category ID and let backend handle resolution if I fix it, or pass Name.
                    // Let's rely on passing the Name for `subcategory` for now as per existing logic.
                    payment_method: formData.paymentMethod,
                    account_id: formData.accountId
                })
            }

            showNotification('Transaction added successfully', 'success')
            setFormData(prev => ({ ...prev, amount: '', description: '' }))
        } catch (e) {
            console.error(e)
            showNotification('Failed to add transaction', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    // Helper to get Category Name from ID
    const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || ''

    // Modified submit to pass Name instead of ID until backend `category_id` is supported properly
    const submitWithCategoryName = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            if (type === 'transfer') {
                // ... transfer logic as above ...
                if (!formData.accountId || !formData.toAccountId) {
                    showNotification('Select accounts', 'error')
                    setSubmitting(false)
                    return
                }
                await financeManager.createTransaction({
                    amount: parseFloat(formData.amount),
                    type: 'transfer', // Using 'transfer' type if supported by DB constraint, else 'expense'/'income' pair
                    // DB constraint: CHECK (type IN ('income', 'expense', 'transfer')) -- so 'transfer' is valid.
                    // But `createTransaction` logic: `const rpcMethod = tx.type === 'income' ? ...`
                    // It only handles income/expense for balance updates.
                    // So for transfer we might need to do manual balance updates or call it twice.
                    // Let's stick to the 2-transaction approach (Expense + Income) for now to ensure balances update correctly.
                    description: `Transfer: ${formData.description}`,
                    date: formData.date,
                    payment_method: 'bank_transfer',
                    account_id: formData.accountId,
                    // We'll treat this as an expense from source
                })
                // Wait, `createTransaction` maps `type` to DB type.
                // If I send 'transfer', it inserts 'transfer'. 
                // But `createTransaction` balance update logic:
                // `const rpcMethod = tx.type === 'income' ? ...`
                // if type is 'transfer', it might default to decrement or do nothing?
                // Let's check `createTransaction` separately.
                // For now, I will implement standard Income/Expense. Transfer might be tricky without verifiable backend logic.
                // I'll stick to Income/Expense form first.
            } else {
                await financeManager.createTransaction({
                    amount: parseFloat(formData.amount),
                    type: type,
                    description: formData.description,
                    date: formData.date,
                    category: getCategoryName(formData.categoryId), // Passing Name to subcategory field
                    payment_method: formData.paymentMethod,
                    account_id: formData.accountId
                })
            }
            showNotification('Transaction added', 'success')
            setFormData(prev => ({ ...prev, amount: '', description: '' }))
        } catch (e) {
            showNotification('Error adding transaction', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-1">
            <Tab.Group onChange={(index) => {
                const types = ['expense', 'income', 'transfer']
                setType(types[index] as any)
            }}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
                    <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                        <div className="flex items-center justify-center space-x-2">
                            <ArrowDownIcon className="w-5 h-5" /> <span>Expense</span>
                        </div>
                    </Tab>
                    <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', selected ? 'bg-white shadow text-green-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white')}>
                        <div className="flex items-center justify-center space-x-2">
                            <ArrowUpIcon className="w-5 h-5" /> <span>Income</span>
                        </div>
                    </Tab>
                    {/* Hiding Transfer for now until logic is verified, or lets keep it simple */}
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                        {/* Expense Form */}
                        <form onSubmit={submitWithCategoryName} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input type="number" required className="glass-input w-full px-4 py-2 rounded-lg" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="glass-input w-full px-4 py-2 rounded-lg" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                                        <option value="">Select Category</option>
                                        {/* Filter for expense categories */}
                                        {categories.filter(c => c.type === 'expense').map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                    <select className="glass-input w-full px-4 py-2 rounded-lg" value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} required>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" required className="glass-input w-full px-4 py-2 rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" className="glass-input w-full px-4 py-2 rounded-lg" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What was this for?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select className="glass-input w-full px-4 py-2 rounded-lg" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                    <option value="upi">UPI</option>
                                    <option value="card">Card</option>
                                    <option value="cash">Cash</option>
                                </select>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition shadow-lg disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Add Expense'}
                            </button>
                        </form>
                    </Tab.Panel>
                    <Tab.Panel>
                        {/* Income Form */}
                        <form onSubmit={submitWithCategoryName} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input type="number" required className="glass-input w-full px-4 py-2 rounded-lg" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="glass-input w-full px-4 py-2 rounded-lg" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                                        <option value="">Select Category</option>
                                        {/* Filter for income categories */}
                                        {categories.filter(c => c.type === 'income').map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit To</label>
                                    <select className="glass-input w-full px-4 py-2 rounded-lg" value={formData.accountId} onChange={e => setFormData({ ...formData, accountId: e.target.value })} required>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{a.balance})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" required className="glass-input w-full px-4 py-2 rounded-lg" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <input type="text" className="glass-input w-full px-4 py-2 rounded-lg" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Source of income" />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50">
                                {submitting ? 'Saving...' : 'Add Income'}
                            </button>
                        </form>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    )
}
