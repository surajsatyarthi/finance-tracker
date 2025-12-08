'use client'

import { useRequireAuth } from '@/contexts/AuthContext'
import TransactionForm from '@/components/TransactionForm'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AddTransactionPage() {
  const { user } = useRequireAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Link href="/dashboard" className="mr-4 p-2 rounded-full hover:bg-gray-200 transition">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Transaction</h1>
            <p className="text-gray-600">Record a new income or expense</p>
          </div>
        </div>

        <TransactionForm />

      </div>
    </div>
  )
}
